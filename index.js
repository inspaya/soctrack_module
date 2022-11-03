let map;
const nigeria = { lat: 9.0065205, lng: 4.1806855 };

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: nigeria,
    zoom: 9,
  });
}

window.initMap = initMap;