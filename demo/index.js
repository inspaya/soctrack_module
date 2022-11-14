var response = {
  "data": [
    {
      "positive": [
        {
          "text": "I hope I can buy fuel today, I hear AA Rano has good prices",
          "lat": 9.0318959,
          "lng": 7.482812200000001
        },
        {
          "text": "Yes! Finally refuelled my car. I was so lucky, as there were only 2 vehicles on the queue",
          "lat": 9.039967,
          "lng": 7.484536299999999
        }
      ],
      "negative": [
        {
          "text": "Black marketers wan kill me o! Imagine N2,500 for 1 litre of fuel!",
          "lat": 9.0623633,
          "lng": 7.458546800000001
        },
        {
          "text": "Another day, another queue, hopefully we'll get fuel today.",
          "lat": 9.0613569,
          "lng": 7.421806200000001
        },
        {
          "text": "I have resolved to cycling as I can't keep up with this fuel madness",
          "lat": 9.0538139,
          "lng": 7.4778843
        },
        {
          "text": "No fuel in my car, no fuel in my gen, no fuel in my life! This country sha!",
          "lat": 9.039967,
          "lng": 7.484536299999999
        },
        {
          "text": "Today was baaaad! Been at the fuel station for over 3hrs and yet no hope to buy fuel :<",
          "lat": 9.2855902,
          "lng": 7.378668900000001
        }
      ],
      "neutral": [
        {
          "text": "This fuel sef, when will we stop suffering from queues",
          "lat": 8.645035199999999,
          "lng": 10.7718025
        }
      ]
    }
  ]
}
var previouslyOpenedInfoWindow = false;
let map;
const nigeria = { lat: 9.0065205, lng: 7.491302 };

let neg = [];
let pos = [];
let nue = [];

function getCordinates(response) {
  let cordData = response.data;

  cordData.forEach(element => {
    element.positive.forEach(item => {
      let x = {
        'text': item.text,
        'lat': item.lat,
        'lng': item.lng
      }
      pos.push(x)
    })

    element.negative.forEach(item => {
      let x = {
        'text': item.text,
        'lat': item.lat,
        'lng': item.lng
      }
      neg.push(x)
    })

    element.neutral.forEach(item => {
      let x = {
        'text': item.text,
        'lat': item.lat,
        'lng': item.lng
      }
      nue.push(x)
    })
  });

  console.log(neg);
  console.log(pos);
  console.log(nue);
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: nigeria,
    zoom: 12,
  });

  getCordinates(response);

  const positiveCoords = pos;
  const negativeCoords = neg;
  const neutralCoords = nue;

  // Geocoder Object
  const geocoder = new google.maps.Geocoder();

  // InfoWindow Object
  infoWindow = new google.maps.InfoWindow();

  // Add markers
  positiveCoords.forEach((item, index) => {
    markerObject = new google.maps.Marker();
    markerObject.setPosition({ lat: item.lat, lng: item.lng });
    markerObject.setIcon('./Happy.png');
    markerObject.setMap(map);
    markerObject.addListener("mouseover", () => {
      if (previouslyOpenedInfoWindow) {
        previouslyOpenedInfoWindow.close();
      }

      infoWindow.setContent(`${item.text} at lat: ${item.lat} and lng: ${item.lng}`);
      previouslyOpenedInfoWindow = infoWindow
      infoWindow.open({ map, shouldFocus: true, });
    });
  });

  negativeCoords.forEach((item, index) => {
    markerObject = new google.maps.Marker();
    latLng = { lat: item.lat, lng: item.lng }
    geocoder.geocode({ location: latLng }).then((response) => {
      if (response.results[0]) {
        infoWindow.setContent(`${item.text} at ${response.results[0].formatted_address}`);
      }
    }).catch((e) => {
      console.log("Geocode failed due to: " + e);
      infoWindow.setContent(`${item.text}`)
    });
    markerObject.setPosition(latLng);
    markerObject.setIcon('./Hate.png');
    markerObject.setMap(map);
    markerObject.addListener("mouseover", () => {
      if (previouslyOpenedInfoWindow) {
        previouslyOpenedInfoWindow.close();
      }

      previouslyOpenedInfoWindow = infoWindow
      infoWindow.open({ map, shouldFocus: true, });
    });
  });

  neutralCoords.forEach((item, index) => {
    markerObject = new google.maps.Marker();
    markerObject.setPosition({ lat: item.lat, lng: item.lng });
    markerObject.setIcon('./Sad.png');
    markerObject.setMap(map);
    markerObject.addListener("mouseover", () => {
      if (previouslyOpenedInfoWindow) {
        previouslyOpenedInfoWindow.close();
      }

      infoWindow.setContent(`${item.text} at lat: ${item.lat} and lng: ${item.lng}`);
      previouslyOpenedInfoWindow = infoWindow
      infoWindow.open({ map, shouldFocus: true, });
    });
  });


  const positivePolygon = new google.maps.Polygon({
    paths: positiveCoords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.7,
    strokeWeight: 2,
    fillColor: "#2e7119",
    fillOpacity: 0.35,
  });

  const negativePolygon = new google.maps.Polygon({
    paths: negativeCoords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.7,
    strokeWeight: 2,
    fillColor: "#dd360f",
    fillOpacity: 0.35,
  });

  const neutralPolygon = new google.maps.Polygon({
    paths: neutralCoords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.7,
    strokeWeight: 2,
    fillColor: "#cfa246",
    fillOpacity: 0.35,
  });

  positivePolygon.setMap(map);
  negativePolygon.setMap(map);
  neutralPolygon.setMap(map);

  positivePolygon.addListener("click", showPositiveMood);
  negativePolygon.addListener("click", showNegativeMood);
  neutralPolygon.addListener("click", showNeutralMood);
}

function showPositiveMood(event) {
  if (previouslyOpenedInfoWindow) {
    previouslyOpenedInfoWindow.close();
  }
  previouslyOpenedInfoWindow = infoWindow;
  infoWindow.setContent("Fuel is available at good prices here!");
  infoWindow.setPosition(event.latLng);
  infoWindow.open(map);
}

function showNegativeMood(event) {
  if (previouslyOpenedInfoWindow) {
    previouslyOpenedInfoWindow.close();
  }
  previouslyOpenedInfoWindow = infoWindow;
  infoWindow.setContent("The fuel situation is bad in this area, please avoid");
  infoWindow.setPosition(event.latLng);
  infoWindow.open(map);
}

function showNeutralMood(event) {
  if (previouslyOpenedInfoWindow) {
    previouslyOpenedInfoWindow.close();
  }
  previouslyOpenedInfoWindow = infoWindow;
  infoWindow.setContent("The fuel situation is uncertain in this area");
  infoWindow.setPosition(event.latLng);
  infoWindow.open(map);
}

window.initMap = initMap;
