require('dotenv').config()
const Twit = require('twit')

const apikey = process.env.API_KEY
const apiKeySecret = process.env.API_KEY_SECRET
const accessToken = process.env.ACCESS_TOKEN
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const token = process.env.BEARER_TOKEN

var T = new Twit({
    consumer_key: apikey,
    consumer_secret: apiKeySecret,
    access_token: accessToken,
    access_token_secret: accessTokenSecret
});


function sortData(data) {
    var sortedData = []
    data.statuses.forEach(element => {
        myEntry = {
            "created_at": element.created_at,
            "text": element.text,
            "truncated": element.truncated,
            "geo": element.geo,
            "coordinates": element.coordinates,
            "place": element.place,
            "contributors": element.contributors,
            "retweeted_status": element.retweeted_status,
            "favorited": element.favorited,
            "retweeted": element.retweeted,
            "possibly_sensitive": element.possibly_sensitive,
            "filter_level": element.filter_level,
            "lang": element.lang,
            "timestamp_ms": element.timestamp_ms
        }
        sortedData.push(myEntry)
    });
    return sortedData;
}

T.get('search/tweets', {
    q: 'Peter Obi',
    "tweet.fields": [
        "geo",
        "lang",
        "text"
    ],
    "expansions": [
        "geo.place_id"
    ],
    "place.fields": [
        "contained_within",
        "country",
        "country_code",
        "full_name",
        "geo",
        "id",
        "name",
        "place_type"
    ], count: 10000
}, function (err, data, response) {
    var tweets = sortData(data)
    console.log(tweets)
})

