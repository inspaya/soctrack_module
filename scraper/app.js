require('dotenv').config()
const Twit = require('twit')
const fs = require('fs')
const request = require('request')


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
            "text": element.full_text,
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

function checkDuplicates(data) {
    let distinct_tweets = []
    let tweet_included = []
    data.forEach(tweet => {
        let tweet_parts = tweet.text.split("https")
        let text = tweet_parts[0].toLowerCase()

        if (!tweet_included.includes(text)) {
            distinct_tweets.push(tweet)
            tweet_included.push(text)
        }
    })
    return distinct_tweets;
}


function checkDuplicates(data){
    var distinct = data.filter( function(){
        
    })

}





T.get('search/tweets', {
    q: '(Fuel in Abuja) OR (Abuja fuel Scarcity) OR (Abuja "Pump price") since:2011-07-11 -RT -from:@',

    "tweet.fields": [
        "geo",
        "lang",
        "text"
    ],
    "tweet_mode": "extended",
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

    "max_id": 1589659499450830800

}, function (err, data) {
    if (err) console.log(err)
    else {
        var tweets = sortData(data)
        jsonReader("response.json", (err, tweetData) => {

            if (err) {
                console.log(err);
                return;
            }
            tweets.forEach(element => tweetData.push(element))

            fs.writeFile("response.json", JSON.stringify(tweetData), err => {
                if (err) console.log("Error writing file:", err);
                jsonReader("response.json", (err, tweetData) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    let distinctTweets = checkDuplicates(tweetData)
                    let jsonTweets = JSON.stringify(distinctTweets)

                    fs.writeFile("../data/response.json", jsonTweets, err => {
                        if (err) console.log("Error writing file:", err);

                            request.post('https://ask.ngmap.live/api/docs',
                            {json : jsonTweets}, function(err, res, body){
                                if(!err && res.statusCode == 200){
                                    console.log(body)
                                }
                            }
                        )

                    });
                });

            });
        });
    }

})


