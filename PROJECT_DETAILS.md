## Inspiration
Imagine you could ask your map for recommendations on specific topics in a specific area. Imagine all the knowledge from user feedback on a product, service, location or experience been put together in a visual form to help you make better decisions. This is what the SocTrack module does.

## What it does
SocTrack takes user-generated responses from the web (currently from Twitter for this demo), performs sentiment analysis on such content, and renders polygons on Google Maps as relates to your search query. This gives a visual overview of what people are saying with respect to your search query in any given area.

## How we built it
Users can enter search terms used to query this service. Such queries are then looked up for matching responses in the internal cache (using a full-text search). Responses matched have been previously analysed for sentiment and are mapped to their geolocations. These responses are then plotted across a Google Map using Polygons to indicate overral sentiment related to the search term.

## Challenges we ran into
* Delays in getting Twitter Developer accounts approved, so we used some mock data.
* Using data that is missing geo-information
* Limitations in correctly assessing the sentiment behind a text due to the use of local slangs that are incorrectly analysed by Google Cloud Natural Language API
* Ran into some bugs on the backend service a day before the deadline and so we had to disable the backend search service.
* Ran into some bugs with the Promise returned from the Geocoding service. Code needs a lot of refactor and future versions will probably have this reverse geocoding done on the backend instead.

## Accomplishments that we're proud of
* The ability to visualize the sentiment behind responses on the map and further group those sentiments by the pre-dominant sentiment on the specific topic for a given area.
* The speed with which we are able to categorize the sentiment behind a response using the Google Cloud Natural Language API and have that indexed for subsequent full-text search.
* The ability to offer more than just markers and text reviews while anonymizing personally identifiable information (PII) from our data sources.

## What we learned
There are lot's of usecases from healthcare, safety/security, economy e.t.c that can be visualized this way for maximum end-user value.

## What's next for SocTrack
* Integrating more data sources e.g. Google Reviews, and more Social Media feeds for user-provided search terms
* Improving the sentiment analysis performed on text written in local slangs to better deduce the mood behind the text
* We are going live very soon. Watch out for us at https://ask.ngmap.live/