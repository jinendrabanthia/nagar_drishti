'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

export default function Map({ onLocationSelect, reports = [] }: { onLocationSelect?: (lat: number, lng: number) => void, reports?: any[] }) {
  useEffect(() => {
    // Fix leaflet icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    );
  }

  // Use a default center, or the first report's location if available
  const defaultCenter: [number, number] = reports.length > 0 ? [reports[0].lat, reports[0].lng] : [40.7128, -74.0060]; // NY default

  return (
    <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Use CartoDB for a cleaner look
      />
      {onLocationSelect && <LocationMarker />}
      {reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]}>
          <Popup>
            <div className="text-sm font-sans w-48">
              <strong className="block mb-1 text-slate-800 text-base">{report.ai_category || 'Report'}</strong>
              <div className="flex space-x-2 mb-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${report.ai_severity > 80 ? 'bg-red-500 text-white' : report.ai_severity > 50 ? 'bg-orange-400 text-white' : 'bg-green-500 text-white'}`}>
                  Score: {report.ai_severity || 'N/A'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${report.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                  {report.status || 'open'}
                </span>
              </div>
              <p className="mt-1 text-slate-600 text-xs line-clamp-2">{report.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
