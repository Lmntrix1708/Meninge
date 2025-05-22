// findPed.js

// Globals
let map, geocoderLayer;

// Initialize Leaflet map & logic
function initMap() {
  // 1) Create the map centered on India
  map = L.map('map').setView([20.5937, 78.9629], 5);

  // 2) Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // 3) Try browser geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        map.setView(loc, 13);
        findPediatricians(loc);
      },
      err => showFallback()
    );
  } else {
    showFallback();
  }

  // 4) Hook up PIN-code fallback
  document.getElementById('zipcode-btn')
    .addEventListener('click', () => {
      const zip = document.getElementById('zipcode-input').value.trim();
      if (!zip) return alert('Please enter a PIN code.');
      // Geocode via Nominatim
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=India&postalcode=${encodeURIComponent(zip)}`
      )
        .then(r => r.json())
        .then(results => {
          if (results.length === 0) throw new Error();
          const { lat, lon } = results[0];
          map.setView([lat, lon], 13);
          findPediatricians([+lat, +lon]);
        })
        .catch(() => alert('Could not locate that PIN code.'));
    });
}

// Show the PIN-code input/button
function showFallback() {
  document.getElementById('zipcode-input').style.display = 'inline-block';
  document.getElementById('zipcode-btn').style.display   = 'inline-block';
}

// Query Overpass for “amenity=doctors” around a point
function findPediatricians([lat, lon]) {
  // Remove old markers layer if present
  if (geocoderLayer) {
    map.removeLayer(geocoderLayer);
  }

  // Overpass QL: find nodes/ways tagged as doctors within 5km
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="doctors"](around:5000,${lat},${lon});
      way["amenity"="doctors"](around:5000,${lat},${lon});
    );
    out center;
  `;

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  })
    .then(r => r.json())
    .then(data => {
      // Create a layer group for markers
      geocoderLayer = L.layerGroup().addTo(map);

      data.elements.forEach(el => {
        const clat = el.type === 'node' ? el.lat : el.center.lat;
        const clon = el.type === 'node' ? el.lon : el.center.lon;

        // build popup HTML
        let info = `<strong>${el.tags.name || 'Pediatrician'}</strong>`;

        // address if present
        const house = el.tags['addr:housenumber'] || '';
        const street = el.tags['addr:street'] || '';
        if (house || street) {
          info += `<br/>${(house + ' ' + street).trim()}`;
        }

        // phone if present
        if (el.tags.phone) {
          info += `<br/>📞 ${el.tags.phone}`;
        }

        // website if present
        if (el.tags.website) {
          const url = el.tags.website.startsWith('http')
            ? el.tags.website
            : 'https://' + el.tags.website;
          info += `<br/><a href="${url}" target="_blank">Website</a>`;
        }

        L.marker([clat, clon])
          .bindPopup(info)
          .addTo(geocoderLayer);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching pediatrician locations.');
    });
}

// Expose initMap so the HTML can call it
window.initMap = initMap;
