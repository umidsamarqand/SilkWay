import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { Destination, LogisticsCorridor, TransitMode } from '../types/travel';
import { CATEGORY_LABELS } from '../data/destinations';
import { 
  Train, 
  Car, 
  Ship, 
  Plane, 
  Layers, 
  Maximize2, 
  Check, 
  Plus, 
  ArrowRight, 
  Clock, 
  Luggage, 
  Star,
  Navigation,
  Building2,
  Bed,
  Eye,
  Phone
} from 'lucide-react';
import { UzbekPoint, CityDistrictInfo } from '../types/travel';

interface MapSectionProps {
  destinations: Destination[];
  allDestinations: Destination[];
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  corridors: LogisticsCorridor[];
  onAddToItinerary: (dest: Destination) => void;
  itineraryIds: Set<string>;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  onSetCamera: (center: { lat: number; lng: number }, zoom: number) => void;
  showAllHubs: boolean;
  onToggleShowAllHubs: () => void;
  uzbekPoints: UzbekPoint[];
  selectedUzbekPoint: UzbekPoint | null;
  onSelectUzbekPoint: (point: UzbekPoint | null) => void;
  showUzbekLayer: boolean;
  onToggleUzbekLayer: () => void;
  activeCityDistrict?: CityDistrictInfo | null;
  onClearActiveCityDistrict?: () => void;
}

// Subcomponent to draw active logistics corridor polylines
const CorridorsRenderer: React.FC<{ corridors: LogisticsCorridor[]; activeCorridorId?: string }> = ({ 
  corridors,
  activeCorridorId
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const polylines: google.maps.Polyline[] = [];

    corridors.forEach((corridor) => {
      const isActive = corridor.id === activeCorridorId;
      const strokeColor = corridor.mode === 'bullet_rail' 
        ? '#2563eb' 
        : corridor.mode === 'maritime_ferry' 
        ? '#0284c7' 
        : '#059669';

      const polyline = new google.maps.Polyline({
        path: corridor.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
        geodesic: true,
        strokeColor: isActive ? '#f59e0b' : strokeColor,
        strokeOpacity: isActive ? 1.0 : 0.75,
        strokeWeight: isActive ? 5 : 3.5,
        map
      });

      polylines.push(polyline);
    });

    return () => {
      polylines.forEach(p => p.setMap(null));
    };
  }, [map, corridors, activeCorridorId]);

  return null;
};

// Subcomponent to animate camera when user clicks a destination or region
const CameraPanController: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ 
  center, 
  zoom 
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
      // Only set zoom if different
      if (map.getZoom() !== zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, center.lat, center.lng, zoom]);

  return null;
};

export const MapSection: React.FC<MapSectionProps> = ({
  destinations,
  allDestinations,
  selectedDestination,
  onSelectDestination,
  corridors,
  onAddToItinerary,
  itineraryIds,
  mapCenter,
  mapZoom,
  onSetCamera,
  showAllHubs,
  onToggleShowAllHubs,
  uzbekPoints,
  selectedUzbekPoint,
  onSelectUzbekPoint,
  showUzbekLayer,
  onToggleUzbekLayer,
  activeCityDistrict,
  onClearActiveCityDistrict
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyCLkCnWwhgBa1R3eZ9Sd9KnlFJzFpG735w';
  const [activeCorridorId, setActiveCorridorId] = useState<string | undefined>(undefined);
  const [showCorridorList, setShowCorridorList] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Quick region jump presets for Uzbekistan
  const regionPresets = [
    { label: '🇺🇿 All Uzbekistan', center: { lat: 40.2, lng: 65.5 }, zoom: 6.5 },
    { label: '🏛️ Samarkand', center: { lat: 39.6542, lng: 66.9597 }, zoom: 12.5 },
    { label: '🕌 Bukhara', center: { lat: 39.7747, lng: 64.4286 }, zoom: 13.0 },
    { label: '🏰 Khiva', center: { lat: 41.3783, lng: 60.3594 }, zoom: 13.5 },
    { label: '🏙️ Tashkent', center: { lat: 41.3110, lng: 69.2405 }, zoom: 12.0 },
    { label: '🏔️ Zaamin & Chimgan', center: { lat: 41.1, lng: 69.4 }, zoom: 8.5 }
  ];

  const displayedDestinations = showAllHubs ? allDestinations : destinations;
  const matchedIds = new Set(destinations.map(d => d.id));

  const getTransitIcon = (mode: TransitMode) => {
    switch (mode) {
      case 'bullet_rail': return <Train className="w-3.5 h-3.5" />;
      case 'scenic_highway': return <Car className="w-3.5 h-3.5" />;
      case 'maritime_ferry': return <Ship className="w-3.5 h-3.5" />;
      case 'regional_flight': return <Plane className="w-3.5 h-3.5" />;
      case 'expedition_4x4': return <Car className="w-3.5 h-3.5" />;
      default: return <Navigation className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full lg:w-[62%] xl:w-[64%] h-full relative flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Floating Map Command Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Quick Region Filters */}
        <div className="flex items-center gap-1 bg-[#091124]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-md shadow-slate-950/40 pointer-events-auto">
          {regionPresets.map((r) => (
            <button
              key={r.label}
              onClick={() => onSetCamera(r.center, r.zoom)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-[#0c1838] rounded-lg transition-colors whitespace-nowrap"
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Right: Map Layers & Stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleUzbekLayer}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border backdrop-blur-md shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              showUzbekLayer
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-[#091124]/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>🇺🇿 Uzbekistan Directory ({uzbekPoints.length})</span>
          </button>

          <button
            onClick={onToggleShowAllHubs}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border backdrop-blur-md shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showAllHubs
                ? 'bg-slate-900 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-[#091124]/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAllHubs ? 'All Global Hubs' : `Matched (${destinations.length})`}</span>
          </button>

          <button
            onClick={() => setShowCorridorList(!showCorridorList)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border backdrop-blur-md shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showCorridorList || activeCorridorId
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-[#091124]/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Corridors ({corridors.length})</span>
          </button>
        </div>
      </div>

      {/* Corridors Dropdown Overlay */}
      {showCorridorList && (
        <div className="absolute top-14 right-3 z-20 w-80 bg-[#0c1838]/98 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-3.5 max-h-96 overflow-y-auto text-slate-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Transit Corridors
            </span>
            <button 
              onClick={() => setActiveCorridorId(undefined)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Reset Highlights
            </button>
          </div>
          <div className="space-y-2">
            {corridors.map((c) => {
              const isSelected = activeCorridorId === c.id;
              return (
                <div 
                  key={c.id}
                  onClick={() => {
                    setActiveCorridorId(isSelected ? undefined : c.id);
                    if (!isSelected && c.waypoints.length > 0) {
                      onSetCamera({ lat: c.waypoints[0].lat, lng: c.waypoints[0].lng }, 6);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-500/10 shadow-sm ring-1 ring-amber-400/40' 
                      : 'border-slate-800 bg-[#091124] hover:border-slate-700 hover:bg-[#0c1838]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{c.title}</span>
                    <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                      {c.durationHours}h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{c.region}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{c.totalDistanceKm} km</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                    {c.frequency}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Google Maps Canvas */}
      <div className="w-full h-full relative">
        <APIProvider apiKey={apiKey} libraries={['marker', 'routes']}>
          <Map
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_git_agentskills_v1']}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            <CameraPanController center={mapCenter} zoom={mapZoom} />
            <CorridorsRenderer corridors={corridors} activeCorridorId={activeCorridorId} />

            {/* Render Advanced Markers for Destinations */}
            {displayedDestinations.map((dest) => {
              const isSelected = selectedDestination?.id === dest.id;
              const isMatched = matchedIds.has(dest.id);
              const inItinerary = itineraryIds.has(dest.id);

              return (
                <AdvancedMarker
                  key={dest.id}
                  position={dest.coordinates}
                  title={`${dest.name}, ${dest.country}`}
                  onClick={() => onSelectDestination(dest)}
                >
                  <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95">
                    {isSelected ? (
                      <Pin
                        background="#0f172a"
                        borderColor="#ffffff"
                        glyphColor="#38bdf8"
                        scale={1.3}
                      />
                    ) : isMatched ? (
                      <Pin
                        background="#2563eb"
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={1.15}
                      />
                    ) : (
                      <Pin
                        background="#94a3b8"
                        borderColor="#ffffff"
                        glyphColor="#f1f5f9"
                        scale={0.9}
                      />
                    )}

                    {/* Floating Title Tooltip on Hover */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-medium rounded shadow-md whitespace-nowrap pointer-events-none z-30">
                      {dest.name} · ${dest.dailyBudgetMin}–${dest.dailyBudgetMax}/day
                    </div>

                    {inItinerary && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for Selected Destination */}
            {selectedDestination && (
              <InfoWindow
                position={selectedDestination.coordinates}
                onCloseClick={() => onSelectDestination(null)}
              >
                <div className="max-w-[280px] p-1 font-sans text-slate-900">
                  <div className="relative h-28 -mx-1 -mt-1 mb-2 rounded-t overflow-hidden bg-slate-100">
                    <img
                      src={selectedDestination.imageUrl}
                      alt={selectedDestination.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-white text-xs font-bold leading-tight">
                        {selectedDestination.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>{selectedDestination.country}</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                      {selectedDestination.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                    {selectedDestination.shortDescription}
                  </p>

                  <div className="p-2 bg-slate-50 rounded border border-slate-100 mb-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Daily Logistics:</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        ${selectedDestination.dailyBudgetMin} – ${selectedDestination.dailyBudgetMax}/day
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Transit:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[150px]">
                        {selectedDestination.transitTimeFromHub}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onAddToItinerary(selectedDestination)}
                      className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 ${
                        itineraryIds.has(selectedDestination.id)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {itineraryIds.has(selectedDestination.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Itinerary</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Route</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
            {/* Render Uzbekistan Points (Hotels, Hostels, Places to Watch, Airport Taxis) */}
            {showUzbekLayer && uzbekPoints.map((point) => {
              const isSelected = selectedUzbekPoint?.id === point.id;
              
              const pinBg = {
                hotel: '#d97706',
                restaurant: '#ea580c',
                hostel: '#059669',
                place_to_watch: '#dc2626',
                airport_taxi: '#eab308'
              }[point.type];

              return (
                <AdvancedMarker
                  key={point.id}
                  position={point.coordinates}
                  title={`${point.name} (${point.city})`}
                  onClick={() => onSelectUzbekPoint(point)}
                >
                  <div className="relative group cursor-pointer transition-transform hover:scale-115 active:scale-95">
                    <Pin
                      background={isSelected ? '#0f172a' : pinBg}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={isSelected ? 1.3 : 1.1}
                    />
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-semibold rounded shadow-md whitespace-nowrap pointer-events-none z-30">
                      {point.name} · {point.city}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for Selected Uzbekistan Point */}
            {selectedUzbekPoint && (
              <InfoWindow
                position={selectedUzbekPoint.coordinates}
                onCloseClick={() => onSelectUzbekPoint(null)}
              >
                <div className="max-w-[280px] p-1 font-sans text-slate-900">
                  <div className="relative h-28 -mx-1 -mt-1 mb-2 rounded-t overflow-hidden bg-slate-100">
                    <img
                      src={selectedUzbekPoint.imageUrl}
                      alt={selectedUzbekPoint.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-950/80 text-white text-[10px] font-bold rounded">
                      {selectedUzbekPoint.type === 'place_to_watch' ? 'Must-See Spot' : selectedUzbekPoint.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-white text-xs font-bold leading-tight">
                        {selectedUzbekPoint.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>{selectedUzbekPoint.city}</span>
                      {selectedUzbekPoint.stars && (
                        <span className="text-amber-500 font-bold tracking-tighter">
                          {'★'.repeat(selectedUzbekPoint.stars)}
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {selectedUzbekPoint.priceUsd !== undefined ? `$${selectedUzbekPoint.priceUsd}` : ''}
                      {selectedUzbekPoint.type === 'hotel' || selectedUzbekPoint.type === 'hostel' 
                        ? '/night' 
                        : selectedUzbekPoint.type === 'restaurant'
                        ? ' avg meal'
                        : selectedUzbekPoint.type === 'airport_taxi' 
                        ? ' fare' 
                        : ' ticket'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                    {selectedUzbekPoint.description}
                  </p>

                  <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-700 mb-2">
                    <strong className="text-slate-900">Logistics:</strong> {selectedUzbekPoint.logisticsNote}
                  </div>

                  {selectedUzbekPoint.phoneOrContact && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>{selectedUzbekPoint.phoneOrContact}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedUzbekPoint.address}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Active City or District Focus Spotlight Marker */}
            {activeCityDistrict && activeCityDistrict.id !== 'all' && (
              <AdvancedMarker
                position={activeCityDistrict.coordinates}
                title={`${activeCityDistrict.name} (${activeCityDistrict.isDistrict ? 'District' : 'City'})`}
                zIndex={150}
              >
                <div className="relative flex flex-col items-center cursor-pointer group">
                  {/* Glowing Radar Pulse Effect */}
                  <div className="absolute -inset-4 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                  <div className="absolute -inset-8 rounded-full bg-blue-500/20 animate-pulse pointer-events-none" />
                  
                  {/* High Visibility Pin Badge */}
                  <div className="px-3 py-1.5 rounded-full bg-slate-950 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xl border-2 border-amber-400 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{activeCityDistrict.name}</span>
                    <span className="text-[10px] text-amber-300 font-mono font-medium px-1 bg-amber-500/20 rounded">
                      {activeCityDistrict.isDistrict ? 'District' : 'City'}
                    </span>
                  </div>

                  {/* Marker Pin Arrow */}
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-slate-950" />
                </div>
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>

        {/* Floating Active City / District Status Badge */}
        {activeCityDistrict && activeCityDistrict.id !== 'all' && (
          <div className="absolute top-16 left-3 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-amber-400/60 shadow-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-300 font-medium">Zoomed to:</span>
            <strong className="text-amber-300">{activeCityDistrict.name}</strong>
            <span className="text-slate-400 text-[11px]">({activeCityDistrict.isDistrict ? 'District' : 'City'})</span>
            {onClearActiveCityDistrict && (
              <button
                onClick={onClearActiveCityDistrict}
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Reset Zoom
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Legend & Map Style Selector */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-[#091124]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800/90 shadow-xl text-slate-300">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
            <span className="text-slate-300">Matched Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-xs"></span>
            <span className="text-slate-300">Hotels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-xs"></span>
            <span className="text-slate-300">Restaurants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-xs"></span>
            <span className="text-slate-300">Hostels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-xs"></span>
            <span className="text-slate-300">Sightseeing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block shadow-xs"></span>
            <span className="text-slate-300">Taxis</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-700/80"></div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold transition-all ${
              mapType === 'roadmap' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold transition-all ${
              mapType === 'terrain' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold transition-all ${
              mapType === 'satellite' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>
    </div>
  );
};
