import axios from 'axios';

// Reverse geocodes GPS coordinates into Area / Ward / District using the
// real Google Maps Geocoding API. This is authoritative — it's always
// re-run on the backend even if the client suggests something different.
export async function reverseGeocode(lat, lng) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set — returning placeholder location data.');
    return { areaName: 'Unknown Area', ward: 'Unknown Ward', district: 'Unknown District' };
  }

  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { latlng: `${lat},${lng}`, key: apiKey },
    });

    if (data.status !== 'OK' || !data.results?.length) {
      return { areaName: 'Unknown Area', ward: 'Unknown Ward', district: 'Unknown District' };
    }

    const components = data.results[0].address_components;
    const find = (type) => components.find((c) => c.types.includes(type))?.long_name;

    // India doesn't have a "ward" field in Google's address component types,
    // so we approximate: sublocality_level_2 (finer) or sublocality_level_1 (broader)
    const areaName = find('sublocality_level_1') || find('locality') || data.results[0].formatted_address;
    const ward = find('sublocality_level_2') || find('sublocality_level_1') || 'Ward Unknown';
    const district = find('administrative_area_level_2') || find('administrative_area_level_1') || 'District Unknown';

    return { areaName, ward, district };
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return { areaName: 'Unknown Area', ward: 'Unknown Ward', district: 'Unknown District' };
  }
}