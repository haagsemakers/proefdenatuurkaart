mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5saW5rIiwiYSI6IlZCS1ZxN28ifQ.7OA0oFvBqk6f_XAIDSpMHA';

var style_url = 'mapbox://styles/urbanlink/cj35v1ofe00032ro0dd6ja34h';
style_url = 'mapbox://styles/mapbox/light-v9';
style_url = 'mapbox://styles/urbanlink/cj3pj2jmf00572rmz7cws716r';
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
  minZoom: 5,
  maxZoom: 18,
  zoom: 12
});
// disable map zoom when using scroll
map.scrollZoom.disable();

map.addControl(new mapboxgl.NavigationControl({
  position: 'top-left'
}));

if (window.location.search.indexOf('embed') !== -1) map.scrollZoom.disable();

var categoryLayers = [];

var popup = new mapboxgl.Popup({
  closeButton: false
});

var filterGroup = document.getElementById('filter-group');

var places = {
  type: 'FeatureCollection',
  features: []
};

map.on('load', function() {
  fetch(data_url).then(function(response) {
    return response.json();
  }).then(function(data) {

    data.features.forEach(function(feature) {
      var lng = parseFloat(feature.geometry.coordinates[0]);
      var lat = parseFloat(feature.geometry.coordinates[1]);
      // var address = fields[0].split(': ')[1];
      // var plots = parseInt(fields[3].split(': ')[1], 10);
      places.features.push({
        type: 'Feature',
        properties: {
          name: feature.properties['Naam'],
          category: feature.properties.category || 'general',
          symbol: 'general'
          // address: address,
          // plots: plots
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    });

    map.addSource('places', {
      type: 'geojson',
      data: places,
      // cluster: true,
      // clusterMaxZoom: 14, // Max zoom to cluster points on
      // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });
    initPlaces();
    listPlaces();
  }).catch(function(err) {
    console.warn('error',err);
  });
});

function initPlaces(){
  places.features.forEach(function(feature) {
    var category = feature.properties['category'] || 'general';
    var layerID = category;

    // Add a layer for this symbol type if it hasn't been added already.
    if (!map.getLayer(layerID)) {
      console.log('add layer ', layerID);
      categoryLayers.push(layerID);
      map.addLayer({
        id: layerID,
        type: 'circle',
        source: 'places',
        paint: {
          "circle-radius": 10,
          'circle-opacity': 0.6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000',
          //'circle-blur': 1,
          // "circle-color": categoryColors[category] || '#eee',
          'circle-color': {
            property: 'category',
            type: 'categorical',
            stops: [
                ['general', '#FFF'],
                ['retail', 'blue'],
                ['Volkstuin', 'purple']]
          }
        },
        // layout: {
        //   'icon-image': 'music-15', //symbol + "-15",
        //   'icon-allow-overlap': true
        // },
        filter: ['==', 'category', category]
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', layerID, function () {
          map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', layerID, function () {
          map.getCanvas().style.cursor = '';
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', layerID, function (e) {

        var h = '<img src="/assets/img/greens.jpg">';
        h += '<br>';
        h += '<div class="popup-text">';
          h += '<div class="title">' + e.features[0].properties.name + '</div>';
          h += '<p class="description">' + e.features[0].properties.name + '</p>';
          h += '<div class="category">' + e.features[0].properties.category + '</div>';
        h += '</div>';
          new mapboxgl.Popup()
              .setLngLat(e.features[0].geometry.coordinates)
              .setHTML(h)
              .addTo(map);
      });

      // Add checkbox and label elements for the layer.
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = layerID;
      input.checked = true;
      filterGroup.appendChild(input);

      var label = document.createElement('label');
      label.setAttribute('for', layerID);
      label.textContent = category;
      filterGroup.appendChild(label);

      // When the checkbox changes, update the visibility of the layer.
      input.addEventListener('change', function(e) {
        map.setLayoutProperty(layerID, 'visibility',
          e.target.checked ? 'visible' : 'none');
      });
    }
  });

  // map.addLayer({
  //   id: 'point',
  //   type: 'circle',
  //   source: 'places',
  //   paint: {
  //     "circle-radius": 6,
  //           "circle-color": "#B42222"
  //   }
  // });
}

function listPlaces() {
  places.features.forEach(function(feature) {
    $('table.placeslist').append('<tr><td>' + feature.properties.name + '</td><td>' + feature.properties.category + '</td></tr>');
  });
}
