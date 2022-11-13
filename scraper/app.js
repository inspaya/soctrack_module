require('dotenv').config()
const Twit = require('twit')
const fs = require('fs')
const { TwitterApi } = require('twitter-api-v2');

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
        }
        sortedData.push(myEntry)
    });
    return sortedData;
}

function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err);
        }
        try {
            const object = JSON.parse(fileData);
            return cb && cb(null, object);
        } catch (err) {
            return cb && cb(err);
        }
    });
}


T.get('search/tweets', {
    q: '("Fuel in Abuja") OR ("Abuja fuel Scarcity") OR (Abuja "Pump price") since:2011-07-11 -RT',
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
    ],
    "count": 10000,
    //"max_id" :1590018283000193000

}, function (err, data) {

    if (err) console.log(err)
    else {
        let data2 = new Set(data.statuses)
        var tweets = sortData(data)
        jsonReader("../data/response.json", (err, tweetData) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(tweetData.length)
            tweets.forEach(element => tweetData.push(element))

            fs.writeFile("../data/response.json", JSON.stringify(tweetData), err => {
                if (err) console.log("Error writing file:", err);
            });
        });
    }

})

