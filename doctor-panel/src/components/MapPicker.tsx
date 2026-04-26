'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

type LatLng = { lat: number; lng: number };

interface Props {
  onChange: (lat: number, lng: number, address: string) => void;
}

export default function MapPicker({ onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current).setView([33.3152, 44.3661], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng]).addTo(map);

        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`
          );
          const d = await r.json();
          const addr = d.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(addr);
          onChange(lat, lng, addr);
        } catch {
          const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(addr);
          onChange(lat, lng, addr);
        }
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onChange]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: 240, borderRadius: 14, border: '1.5px solid var(--ink-200)', overflow: 'hidden' }}
      />
      {address ? (
        <div className="map-address">{address}</div>
      ) : (
        <div className="map-address" style={{ color: 'var(--ink-400)' }}>
          Konumunuzu seçmek için haritaya tıklayın
        </div>
      )}
    </div>
  );
}
