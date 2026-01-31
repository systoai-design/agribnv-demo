import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Property } from '@/types/database';

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedPropertyId?: string;
  className?: string;
}

// Free OpenStreetMap-based style
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const PropertyMap = ({
  properties,
  onPropertySelect,
  selectedPropertyId,
  className = '',
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

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

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center,
      zoom: 6,
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add markers when properties or map changes
  useEffect(() => {
    if (!map.current) return;

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

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [properties, selectedPropertyId, onPropertySelect]);

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

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
    </div>
  );
};

export default PropertyMap;
