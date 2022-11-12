from os import environ
from string import punctuation
from typing import Union

from redis import asyncio as aioredis, Redis
from redis.commands.search.field import TextField
from redis.commands.search.query import Query
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.exceptions import ResponseError
from fastapi import FastAPI, BackgroundTasks

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

from redis_om.model import Field, JsonModel

from demo.google_nlp import analyze_batch

REDIS_SEARCH_QUERY_INDEX = "search_query_idx"
EXCLUDED_REDISEARCH_XTERS = [f"{_chr}" for _chr in punctuation]
EXCLUDED_REDISEARCH_XTERS.remove("|")
EXCLUDED_REDISEARCH_XTERS.remove(".")
RESULT_COUNT = 1000
RESULT_RADIUS = 1500
CACHE_EXPIRY_24HRS = 86400
ASKNGMAP_DEFAULT_MARKER = {"tweet": "AskNGMap.Live", "lat": 8.8941, "lng": 7.1860}

_async_redis_conn = aioredis.from_url(environ.get("REDIS_OM_URL"))


class AskNgMapEngine:

    @staticmethod
    def sanitize_redisearch_query_str(_dirty_query_str: str):
        _dirty_query_str = list(_dirty_query_str)
        _longer_range = len(EXCLUDED_REDISEARCH_XTERS) if len(EXCLUDED_REDISEARCH_XTERS) > len(
            _dirty_query_str) else len(_dirty_query_str)
        for _x in range(0, _longer_range):
            for _token in EXCLUDED_REDISEARCH_XTERS:
                if _token in _dirty_query_str:
                    _dirty_query_str.insert(_dirty_query_str.index(_token), "")
                    _dirty_query_str.remove(_token)

        _cleaned_query_str = ''.join(_dirty_query_str)
        _cleaned_query_str = _cleaned_query_str.replace("askngmap_query", "")
        _cleaned_query_str = _cleaned_query_str.split("|")
        _cleaned_query_str = [_str_part.replace(".", "?") for _str_part in _cleaned_query_str if
                              "?" not in _str_part and _str_part != "|"]
        _cleaned_query_str = [
            "( " + _str_part + " )" for _str_part in _cleaned_query_str if _str_part != "|"
        ]
        return ' | '.join(_cleaned_query_str)

    @staticmethod
    def get_tweet_coords():
        pass


class SocTrackMood(JsonModel):
    tweet: str = Field(index=True)
    sentiment: str = Field(index=True)
    lat: float = Field(index=True)
    lng: float = Field(index=True)

    def __repr__(self):
        return f"<Mood: {self.text} assessed as {self.sentiment}>"

    class Meta:
        database = _async_redis_conn


app = FastAPI(openapi_url="/api/openapi.json", docs_url="/api/docs", redoc_url=None)

_search_query_index_def = IndexDefinition(
    index_type=IndexType.JSON,
    prefix=['askngmap_query:'],
    score=0.5,
    score_field='doc-score'
)

_search_schema = (
    TextField('$.tweet', as_name='tweet'),
)

# create a full-text search attached to the Tweet index
try:
    _available_ft_indices = [_idx.decode("utf-8") for _idx in _async_redis_conn.execute_command("FT._LIST") if
                             _idx is not None]
    if REDIS_SEARCH_QUERY_INDEX in _available_ft_indices:
        _async_redis_conn.ft(REDIS_SEARCH_QUERY_INDEX).dropindex(delete_documents=False)

    _async_redis_conn.ft(REDIS_SEARCH_QUERY_INDEX).create_index(_search_schema, definition=_search_query_index_def)
except ResponseError as e:
    print(e)


class TwitterBridge:

    @staticmethod
    async def tweets_analyzer(redis_conn: Redis, new_tweets_list: list):
        pass


@app.get("/api/v1/search/")
@cache(expire=CACHE_EXPIRY_24HRS)
async def get_search_results(customer_location: Union[str, None] = None, query: Union[str, None] = None):
    try:
        if customer_location is None:
            customer_location = f"{ASKNGMAP_DEFAULT_MARKER['lng']}, {ASKNGMAP_DEFAULT_MARKER['lat']}"

        if query is None:
            search_results = _async_redis_conn.geosearch(
                name="tweet_geospatial_index",
                longitude=float(customer_location.split(",")[0]),
                latitude=float(customer_location.split(",")[1]),
                radius=RESULT_RADIUS,
                unit="mi",
                sort="ASC",
                count=RESULT_COUNT,
                any=False,
                withcoord=True,
                withdist=True
            )
            query = '|'.join([_entry[0].decode("utf-8") for _entry in search_results])

        query = AskNgMapEngine.sanitize_redisearch_query_str(query)
        _search_query = f' (@tweet: ( {query} ) )'
        _search_query = Query(query_string=_search_query).paging(offset=0, num=RESULT_COUNT)
        search_results = _async_redis_conn.ft(index_name=REDIS_SEARCH_QUERY_INDEX).search(_search_query).docs

        if len(search_results) > 0:
            return {"data": search_results}
        else:
            return {"data": [ASKNGMAP_DEFAULT_MARKER]}
    except Exception as e:
        print(e)
        return {"data": [ASKNGMAP_DEFAULT_MARKER]}


@app.post("/api/v1/callbacks/receive_tweets")
async def ingest_tweet_data(new_tweets_list: list, gmaps_tweet_plotter: BackgroundTasks):
    unprocessed_tweets = []
    try:
        _tweets_analysed_and_pending_geocoding, _unprocessed_tweets = await TwitterBridge.tweets_analyzer(
            _async_redis_conn, new_tweets_list
        )

        # Plot tweet locations in the background, so we can return to Tweet scraping service
        gmaps_tweet_plotter.add_task(AskNgMapEngine.get_tweet_coords, _tweets_analysed_and_pending_geocoding)

        unprocessed_tweets = _unprocessed_tweets
        _registration_count = len(_tweets_analysed_and_pending_geocoding)
        response = f"{_registration_count} tweets received and geo-tagged."
    except Exception as e:
        print(e)

    if len(unprocessed_tweets) > 0:
        exception_response = {
            "message": f"An error occurred while processing {len(unprocessed_tweets)} tweets",
            "unprocessed_tweets": unprocessed_tweets
        }
        return {"data": response, "warning": exception_response}

    return {"data": response}


@app.on_event("startup")
async def load():
    aioredis_conn = _async_redis_conn
    FastAPICache.init(RedisBackend(aioredis_conn), prefix="askngmap_search_cache")
