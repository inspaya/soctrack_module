let map;
const nigeria = { lat: 9.0065205, lng: 4.1806855 };

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: nigeria,
    zoom: 7,
  });

  const positiveCoords = pos;
  const negativeCoords = neg;
  const neutralCoords = neu;

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
}

window.initMap = initMap;