/** Shim to connect to Mapbox geocoder */

import 'isomorphic-fetch'

// set to your mapbox public key, not mine, please
const MAPBOX_KEY = 'pk.eyJ1IjoibWF0dHdpZ3dheSIsImEiOiJjaWhqZXNtYTYwNW1vdTJqNzlqYTBwaDQ3In0.NNdXwpMqh-hODe-RfAD7iA'

/** Geocode the given address, within the given bbox if provided. Return a promise to return [lat, lon] */
export default function geocode (address, bbox) {
  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_KEY}`

  if (bbox != null) {
    let lat = (bbox.north + bbox.south) / 2
    let lon = (bbox.west + bbox.east) / 2

    url += `&proximity=${lon},${lat}`
  }

  return fetch(url)
    .then(d => d.json())
    .then(d => {
      let coords
      if (bbox) {
        coords = d.features.filter(f => f.geometry.coordinates[0] < bbox.east && f.geometry.coordinates[0] > bbox.west &&
          f.geometry.coordinates[1] < bbox.north && f.geometry.coordinates[1] > bbox.south)[0].geometry.coordinates
      } else {
        coords = d.features[0].geometry.coordinates
      }

      return [coords[1], coords[0]]
    })
}
