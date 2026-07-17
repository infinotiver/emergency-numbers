navigator.geolocation.getCurrentPosition(success, error);
const countryLabel = document.getElementById('country-label');

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    reverseGeocode(lat, lon);
}

function error(err) {
    countryLabel.innerHTML = "<h2>something went wrong</h2><p>try reloading the website</p>";
}

async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    const data = await res.json();

    const country = data.address.country;
    const country_code = data.address.country_code;
    countryLabel.innerHTML = `<span class="country-name">${country}</span>`;
    searchByCountry(country_code);
}

let emergencyData = [];

fetch("https://raw.githubusercontent.com/infinotiver/emergency-number-api/refs/heads/main/data/data.json")
    .then(res => res.json())
    .then(data => {
        emergencyData = data;
    });

function searchByCountry(countryCode) {
    const results = emergencyData[countryCode.toUpperCase()];
    if (results) {
        renderResults(results);
    }
}

function renderResults(data) {
    const resultsDiv = document.getElementById('result');
    const notesDiv = document.getElementById('notes-container');

    resultsDiv.innerHTML = "";
    notesDiv.innerHTML = "";

    const police = `
    <div class="card">
      <div class="card-number">${data.police || ""}</div>
      <div class="card-title">
        <i class="fa-solid fa-shield-halved"></i> police
      </div>
    </div>
    `;

    const ambulance = `
    <div class="card">
      <div class="card-number">${data.ambulance || ""}</div>
      <div class="card-title">
        <i class="fa-solid fa-kit-medical"></i> ambulance
      </div>
    </div>
    `;

    const fire = `
    <div class="card">
      <div class="card-number">${data.fire || ""}</div>
      <div class="card-title">
        <i class="fa-solid fa-fire-extinguisher"></i> fire
      </div>
    </div>
    `;

    resultsDiv.innerHTML = police + ambulance + fire;

    if (data.notes) {
        notesDiv.innerHTML = `<p>${data.notes}</p>`;
    }
}

let mapInitialized = false;

document.getElementById("change-location").addEventListener("click", () => {
    const mapWrap = document.getElementById("map-container");
    mapWrap.style.display = "flex"; 

    if (!mapInitialized) {
        initMap();

        setTimeout(() => {
            map.invalidateSize();
        }, 10);
        mapInitialized = true;
    }
});


document.getElementById("map-container").addEventListener("click", (e) => {
    if (e.target.id === "map-container") {
        e.target.style.display = "none";
    }
});

function initMap() {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', async function (e) {
        const { lat, lng } = e.latlng;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        const country = data.address?.country;

        if (country) {
            const mapWrap = document.getElementById("map-container");
            mapWrap.style.display = "none";

            const countryCode = data.address.country_code;
            if (countryCode) {
                countryLabel.innerHTML = `<span class="country-name">${country}</span>`;
                searchByCountry(countryCode);
            } else {
                alert("could not detect country code");
            }
        } else {
            alert("could not detect country");
        }
    });
}