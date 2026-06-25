'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export default function LocationDisplay() {
  const [location, setLocation] = useState<string>('Locating...');

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocation('Location unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Local Area';
          setLocation(city);
        } catch (e) {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      (error) => {
        setLocation('Location disabled');
      }
    );
  }, []);

  return (
    <span className="text-teal-500 text-sm font-medium flex items-center gap-1 ml-2">
      <MapPin size={16} /> {location}
    </span>
  );
}
