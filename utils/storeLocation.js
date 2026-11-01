// Physical pharmacy location (single store). Pin taken from the Google Maps place "Dr Saba Faeli Pharmacy".
const LAT = 35.7214546
const LNG = 51.3614756

export const STORE_LOCATION = {
  name: 'داروخانه دکتر صبا فائلی',
  latitude: LAT,
  longitude: LNG,
  // OpenStreetMap embed needs no API key (Google Maps tiles are unreliable in Iran)
  embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${LNG - 0.004},${LAT - 0.0025},${LNG + 0.004},${LAT + 0.0025}&layer=mapnik&marker=${LAT},${LNG}`,
  directions: [
    { key: 'neshan', label: 'نشان', url: `https://nshn.ir/?lat=${LAT}&lng=${LNG}` },
    { key: 'google', label: 'گوگل مپ', url: `https://www.google.com/maps/dir/?api=1&destination=${LAT}%2C${LNG}` },
    { key: 'waze', label: 'ویز', url: `https://waze.com/ul?ll=${LAT},${LNG}&navigate=yes` },
  ],
}
