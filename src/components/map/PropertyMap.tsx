import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Property } from '@/types/database';

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onPropertyNavigate?: (propertyId: string) => void;
  selectedPropertyId?: string;
  className?: string;
}

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));

const PropertyMap = ({
  properties,
  onPropertySelect,
  onPropertyNavigate,
  selectedPropertyId,
  className = '',
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const propertiesWithCoords = properties.filter(
      (p) => p.latitude && p.longitude
    );

    const defaultCenter: [number, number] = [121.0, 14.5];
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

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      popupRef.current?.remove();
      popupRef.current = null;
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const cancelHide = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleHide = () => {
      cancelHide();
      hideTimerRef.current = window.setTimeout(() => {
        popupRef.current?.remove();
        popupRef.current = null;
      }, 250);
    };

    const showHoverPopup = (property: Property) => {
      if (!map.current || !property.latitude || !property.longitude) return;
      cancelHide();

      const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
      const imageUrl = primaryImage?.image_url || '/placeholder.svg';

      const html = `
        <div class="property-hover-card">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(property.name)}" loading="lazy" />
          <div class="body">
            <p class="name">${escapeHtml(property.name)}</p>
            <p class="loc">${escapeHtml(property.location)}</p>
            <p class="price"><span>₱${property.price_per_night.toLocaleString()}</span> / night</p>
          </div>
        </div>
      `;

      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 20,
        anchor: 'bottom',
        className: 'property-hover-popup',
      })
        .setLngLat([property.longitude, property.latitude])
        .setHTML(html)
        .addTo(map.current);

      const popupEl = popupRef.current.getElement();
      if (popupEl) {
        popupEl.style.cursor = 'pointer';
        popupEl.addEventListener('mouseenter', cancelHide);
        popupEl.addEventListener('mouseleave', scheduleHide);
        popupEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onPropertyNavigate?.(property.id);
        });
      }
    };

    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

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
        map.current?.flyTo({
          center: [property.longitude!, property.latitude!],
          zoom: 12,
          duration: 1500,
          essential: true,
        });
      });

      el.addEventListener('mouseenter', () => showHoverPopup(property));
      el.addEventListener('mouseleave', scheduleHide);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [properties, selectedPropertyId, onPropertySelect, onPropertyNavigate]);

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
