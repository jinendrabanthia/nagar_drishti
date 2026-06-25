'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

import type { Report } from '@/app/official/DashboardClient';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export default function Map({ onLocationSelect, reports = [] }: { onLocationSelect?: (lat: number, lng: number) => void, reports?: Report[] }) {
  const defaultCenter: [number, number] = reports.length > 0 ? [reports[0].lat, reports[0].lng] : [20.5937, 78.9629]; // India default
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [pinCode, setPinCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fix leaflet icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const handleSearch = async () => {
    if (!pinCode) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&countrycodes=in&format=json`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("Pin code not found");
      }
    } catch (e) {
      console.error(e);
      alert("Error searching for pin code");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {onLocationSelect && (
        <div className="absolute top-2 right-2 z-[400] flex gap-2">
          <input 
            type="text"
            value={pinCode}
            onChange={e => setPinCode(e.target.value)}
            placeholder="Enter Pin Code"
            className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 text-slate-800"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-md"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </div>
      )}
      <MapContainer center={mapCenter} zoom={onLocationSelect ? 5 : 13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
        <MapController center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
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
    </div>
  );
}

function LocationMarker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}
