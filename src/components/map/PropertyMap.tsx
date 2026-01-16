import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedPropertyId?: string;
  className?: string;
}

const PropertyMap = ({
  properties,
  onPropertySelect,
  selectedPropertyId,
  className = '',
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [isTokenSet, setIsTokenSet] = useState(() => {
    return !!localStorage.getItem('mapbox_token');
  });
  const [tokenInput, setTokenInput] = useState('');

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setIsTokenSet(true);
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setIsTokenSet(false);
    setTokenInput('');
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    // Calculate center from properties with coordinates
    const propertiesWithCoords = properties.filter(
      (p) => p.latitude && p.longitude
    );
    
    const defaultCenter: [number, number] = [121.0, 14.5]; // Philippines center
    let center = defaultCenter;
    
    if (propertiesWithCoords.length > 0) {
      const avgLat =
        propertiesWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) /
        propertiesWithCoords.length;
      const avgLng =
        propertiesWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) /
        propertiesWithCoords.length;
      center = [avgLng, avgLat];
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom: 6,
        pitch: 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );
    } catch (error) {
      console.error('Error initializing map:', error);
      handleClearToken();
    }

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  // Add markers when properties or map changes
  useEffect(() => {
    if (!map.current || !isTokenSet) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for properties with coordinates
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div class="relative cursor-pointer transform transition-transform hover:scale-110 ${
          selectedPropertyId === property.id ? 'scale-110 z-10' : ''
        }">
          <div class="${
            selectedPropertyId === property.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          } px-3 py-1.5 rounded-full shadow-lg border border-border font-semibold text-sm whitespace-nowrap">
            ₱${property.price_per_night.toLocaleString()}
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        onPropertySelect?.(property);
        
        // Fly to property
        map.current?.flyTo({
          center: [property.longitude!, property.latitude!],
          zoom: 12,
          duration: 1500,
          essential: true,
        });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [properties, selectedPropertyId, onPropertySelect, isTokenSet]);

  // Fly to selected property
  useEffect(() => {
    if (!map.current || !selectedPropertyId) return;

    const property = properties.find((p) => p.id === selectedPropertyId);
    if (property?.latitude && property?.longitude) {
      map.current.flyTo({
        center: [property.longitude, property.latitude],
        zoom: 12,
        duration: 1500,
        essential: true,
      });
    }
  }, [selectedPropertyId, properties]);

  if (!isTokenSet) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-xl p-6 ${className}`}>
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Enable Map View</h3>
        <p className="text-muted-foreground text-center text-sm mb-4 max-w-sm">
          To see properties on the map, enter your Mapbox public token. 
          Get one free at{' '}
          <a
            href="https://mapbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            mapbox.com
          </a>
        </p>
        <div className="flex gap-2 w-full max-w-sm">
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSetToken} disabled={!tokenInput.trim()}>
            Enable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
      <button
        onClick={handleClearToken}
        className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background transition-colors"
        title="Clear Mapbox token"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PropertyMap;
