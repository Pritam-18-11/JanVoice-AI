import axios from 'axios';

// FREE reverse geocoding via OpenStreetMap's Nominatim API — no API key, no
// billing account, no credit card required. Usage policy: keep requests to
// roughly 1/second and always send a descriptive User-Agent (required by
// Nominatim's fair-use policy, not optional).
export async function reverseGeocode(lat, lng) {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon: lng,
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        // Replace the email with your own — Nominatim asks for a way to contact you if usage needs to be throttled
        'User-Agent': 'JanVoiceAI-Hackathon-Project/1.0 (fspritam444@gmail.com)',
      },
    });

    const address = data.address || {};

    const areaName =
      address.suburb ||
      address.neighbourhood ||
      address.road ||
      address.village ||
      data.display_name?.split(',')[0] ||
      'Unknown Area';

    const ward = address.suburb || address.neighbourhood || address.city_district || 'Ward Unknown';

    const district = address.state_district || address.county || address.city || 'District Unknown';

    return { areaName, ward, district };
  } catch (err) {
    console.error('Nominatim geocoding error:', err.message);
    return { areaName: 'Unknown Area', ward: 'Unknown Ward', district: 'Unknown District' };
  }
}