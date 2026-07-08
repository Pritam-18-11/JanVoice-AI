import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Compass, Loader2 } from 'lucide-react';
import api from '../api/axios';

// Fix default Leaflet icon paths in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPicker({ onLocationSelected }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState({ lat: 22.6985, lng: 88.4532 }); // Default: Madhyamgram/Kolkata
  const [locDetails, setLocDetails] = useState({
    areaName: 'Madhyamgram',
    ward: 'Ward Unknown',
    district: 'North 24 Parganas',
  });
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
      });

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateLocation(position.lat, position.lng);
      });

      // Run a real geocode for the default starting position on first load
      updateLocation(coords.lat, coords.lng);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocation = async (lat, lng) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));
    setCoords({ lat: formattedLat, lng: formattedLng });

    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([formattedLat, formattedLng]);
      mapRef.current.panTo([formattedLat, formattedLng]);
    }

    setGeocoding(true);
    try {
      // Real reverse geocoding via our backend (proxies Google Maps Geocoding API)
      const { data } = await api.get('/geocode', { params: { lat: formattedLat, lng: formattedLng } });
      setLocDetails(data);
      onLocationSelected({ lat: formattedLat, lng: formattedLng, ...data });
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      const fallback = { areaName: 'Unknown Area', ward: 'Unknown Ward', district: 'Unknown District' };
      setLocDetails(fallback);
      onLocationSelected({ lat: formattedLat, lng: formattedLng, ...fallback });
    } finally {
      setGeocoding(false);
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude).finally(() => setLocating(false));
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to access your location. Please pick a point on the map manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 font-bold block mb-0.5">Area Name</span>
          <span className="font-semibold text-slate-800">{geocoding ? 'Looking up...' : locDetails.areaName}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block mb-0.5">Ward No</span>
          <span className="font-semibold text-slate-800">{geocoding ? '...' : locDetails.ward}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block mb-0.5">District</span>
          <span className="font-semibold text-slate-800">{geocoding ? '...' : locDetails.district}</span>
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-[260px] w-full rounded-2xl border border-slate-200/80 shadow-inner overflow-hidden z-10"
        />

        <button
          type="button"
          onClick={fetchCurrentLocation}
          disabled={locating}
          className="absolute bottom-4 right-4 z-20 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
        >
          {locating ? (
            <span className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Navigation className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
          )}
          {locating ? 'Locating...' : 'Get Current Location'}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Coordinates: {coords.lat}, {coords.lng}</span>
        </div>
        {geocoding ? (
          <span className="text-[10px] text-sky-500 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Reverse geocoding...
          </span>
        ) : (
          <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100">
            Google Maps Geocoding API
          </span>
        )}
      </div>
    </div>
  );
}