const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');
const latitude = urlParams.get('latitude');
const longitude = urlParams.get('longitude');
const departureAirport = urlParams.get('departureAirport');
const arrivalAirport = urlParams.get('arrivalAirport');

let map = L.map('map').setView([latitude || 51.505, longitude || -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

if (latitude && longitude) {
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`Flight here`)
        .openPopup();
} else {
    alert('Coordinates not provided in the URL. Map is centered at the default location.');
}

const handleProfileHREF = () => {
    const token = localStorage.getItem('authToken');
    const profileHref = $('#profile-href');

    if (token) {
        profileHref.attr('href', '/profile');
    } else {
        profileHref.attr('href', '/login');
    }
}

$('#track-info').html(`
    <div class="track-info-item">
        <h4>Аеропорт вильоту</h4>
        <p><span>${departureAirport}</span></p>
    </div>
    <div class="track-info-item">
        <h4>Аеропорт прибуття</h4>
        <p><span>${arrivalAirport}</span></p>
    </div>
    <div class="track-info-item">
        <h4>Широта</h4>
        <p><span>${latitude}</span></p>
    </div>
    <div class="track-info-item">
        <h4>Довгота</h4>
        <p><span>${longitude}</span></p>
    </div>
`);

handleProfileHREF()