/* eslint-disable */

//TRICK we get information of locations, the one was passed using the trick of property data-locations in template.
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoicGRyY2x2IiwiYSI6ImNrZWl4ZWIzNzBwaGYycXBkb3I1YnJnZmkifQ.Ic14uaLheQNgAca2badVUA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/pdrclv/ckioor7s54zoi17qsizk5sy0r',
  scrollZoom: false,
  /*center:[-118.113491, 34.111745],
  zoom: 9,
  interactive: false,*/
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';
  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  }).setLngLat(loc.coordinates).addTo(map);

  //Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  }
});
