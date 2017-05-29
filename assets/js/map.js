mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5saW5rIiwiYSI6IlZCS1ZxN28ifQ.7OA0oFvBqk6f_XAIDSpMHA';

var style_url = 'mapbox://styles/urbanlink/cj35v1ofe00032ro0dd6ja34h';
style_url = 'mapbox://styles/mapbox/light-v9';
var data_url = 'https://api.mapbox.com/datasets/v1/urbanlink/cj344049800042wnoibpdmpot/features?access_token=pk.eyJ1IjoidXJiYW5saW5rIiwiYSI6IlZCS1ZxN28ifQ.7OA0oFvBqk6f_XAIDSpMHA';

var bounds = [
  [52.004269, 4.101677], // sw
  [52.010398, 4.027176] // ne
];

var map = new mapboxgl.Map({
  container: 'map',
  style: style_url,
  center: [4.300700, 52.070498],
  // maxBounds: bounds,
  minZoom: 10,
  zoom: 11
});

map.addControl(new mapboxgl.NavigationControl({
  position: 'top-left'
}));

if (window.location.search.indexOf('embed') !== -1) map.scrollZoom.disable();

var popup = new mapboxgl.Popup({
  closeButton: false
});

map.on('load', function() {

  var geojson = {
    type: 'FeatureCollection',
    features: []
  };

  fetch(data_url).then(function(response) {
    return response.json();
  }).then(function(data) {
    data.features.forEach(function(d) {
      var lng = parseFloat(d.geometry.coordinates[0]);
      var lat = parseFloat(d.geometry.coordinates[1]);
      // var address = fields[0].split(': ')[1];
      // var plots = parseInt(fields[3].split(': ')[1], 10);

      geojson.features.push({
        type: 'Feature',
        properties: {
          name: d.properties.Naam,
          category: d.properties.category
          // address: address,
          // plots: plots
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    });
    console.log(geojson);
    // Add reponse data as a new source on the map
    map.addSource('data', {
      type: 'geojson',
      data: geojson
    });

    map.addLayer({
      id: 'point',
      type: 'circle',
      source: 'data',
      paint: {
        'circle-color': 'lightgreen',
      }
    }, 'waterway-label');


  }).catch(function() {
    console.warn('error');
  });


  // Point popup to display Graffiti count
  map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['point']
    });

    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

    if (!features.length) {
      popup.remove();
      return;
    }

    var feature = features[0];

    var contents = document.createElement('div');

    var title = document.createElement('strong');
    title.textContent = feature.properties.name;

    var category = document.createElement('div');
    category.textContent = feature.properties.category;

    contents.appendChild(title);
    contents.appendChild(category);

    popup.setLngLat(feature.geometry.coordinates)
      .setHTML(contents.innerHTML)
      .addTo(map);
  });
});
