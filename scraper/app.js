
const Twit = require('twit')
const fs = require('fs')

const apikey = '13Hqw6f9ZIpHgbRjyisGeHOHn'
const apiSecretKey = 'PI6wM8FozMPPp9PuwxCXK4K0RRrwy2mXMqecwmKu8RBwiI7RyX'
const accessToken = '3131304285-BIW2u1BzZxa2DVcbJCGTLEFfrkShUenudRmpRYc'
const accessTokenSecret = 'I0p8V3Tpnn0KAx6BbLEXBJYTDUsSS427dbtLRitHOB09H'

var T = new Twit({
    // consumer_key: apikey,
    // consumer_secret: apiSecretKey,
    // access_token: accessToken,
    // access_token_secret: accessTokenSecret,
});

var mySearch = process.argv[2]

async function tweets(keywords) {
    var tweets;
    T.get('search/tweets', { q: keywords, count: 100 }, function (err, data, response) {
        tweets = data.statuses;
        console.log(tweets)
    })
    return tweets;
}


var statuses = tweets(mySearch)

filePath = "./response.json"
var data = JSON.parse(fs.readFileSync(filePath));
var statuses = []

for(i = 0; i < 8; i++){
    statuses.push(data)
}
console.log(statuses.length)

function sortData(data){
    var sortedData = []
    statuses.filter(x => x.user.geo_enabled == false).forEach(element => {
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

console.log(sortData(statuses.toString()))
