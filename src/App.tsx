import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MapSection } from './components/MapSection';
import { FilterSidebar } from './components/FilterSidebar';
import { DispatchPlanModal } from './components/DispatchPlanModal';
import { DESTINATIONS, LOGISTICS_CORRIDORS } from './data/destinations';
import { UZBEKISTAN_POINTS } from './data/uzbekistanData';
import { Destination, FilterState, ItineraryStop, UzbekPoint, SidebarTab, CityDistrictInfo } from './types/travel';

export default function App() {
  // Initial Filter State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedRegion: 'all',
    departureDate: '2026-10-10',
    returnDate: '2026-10-22',
    budgetRange: [30, 220],
    budgetTier: 'all',
    selectedCategories: [],
    selectedTransitModes: [],
    luggageForwardingOnly: false,
    maxTransitTimeHours: 12
  });

  const [activeTab, setActiveTab] = useState<SidebarTab>('hotels');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showAllHubs, setShowAllHubs] = useState<boolean>(true);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);

  // Uzbekistan Points & Layer State
  const [selectedUzbekPoint, setSelectedUzbekPoint] = useState<UzbekPoint | null>(null);
  const [showUzbekLayer, setShowUzbekLayer] = useState<boolean>(true);
  const [activeCityDistrict, setActiveCityDistrict] = useState<CityDistrictInfo | null>(null);

  // Map camera state focused on Uzbekistan
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 40.2, lng: 65.5 });
  const [mapZoom, setMapZoom] = useState<number>(6.8);

  // Initial seeded itinerary with iconic Silk Road hubs
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([
    {
      id: 'stop-1',
      destination: DESTINATIONS[0], // Samarkand
      days: 3,
      transitOption: 'bullet_rail'
    },
    {
      id: 'stop-2',
      destination: DESTINATIONS[1], // Bukhara
      days: 2,
      transitOption: 'bullet_rail'
    },
    {
      id: 'stop-3',
      destination: DESTINATIONS[2], // Khiva
      days: 2,
      transitOption: 'scenic_highway'
    }
  ]);

  // Reactive filtering of destinations
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(query);
        const matchesCountry = dest.country.toLowerCase().includes(query);
        const matchesHighlight = dest.highlight.toLowerCase().includes(query);
        const matchesTag = dest.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCountry && !matchesHighlight && !matchesTag) {
          return false;
        }
      }

      // 2. Region Filter (Uzbekistan regions/cities)
      if (filter.selectedRegion !== 'all') {
        const reg = filter.selectedRegion.toLowerCase();
        const matchesReg = 
          dest.id.toLowerCase().includes(reg) || 
          dest.name.toLowerCase().includes(reg) ||
          dest.tags.some(t => t.toLowerCase().includes(reg));
        if (!matchesReg) return false;
      }

      // 3. Budget Range Filter (overlap check)
      const [filterMin, filterMax] = filter.budgetRange;
      if (dest.dailyBudgetMin > filterMax || dest.dailyBudgetMax < filterMin) {
        return false;
      }

      // 4. Preferred Activity Categories
      if (filter.selectedCategories.length > 0) {
        const hasCategory = filter.selectedCategories.some(cat =>
          dest.allCategories.includes(cat)
        );
        if (!hasCategory) return false;
      }

      // 5. Preferred Transit Mode
      if (filter.selectedTransitModes.length > 0) {
        if (!filter.selectedTransitModes.includes(dest.logisticsMode)) {
          return false;
        }
      }

      // 6. Luggage Forwarding requirement
      if (filter.luggageForwardingOnly && !dest.luggageForwardingSupported) {
        return false;
      }

      return true;
    });
  }, [filter]);

  // Itinerary Management
  const handleAddToItinerary = (dest: Destination) => {
    setItinerary((prev) => {
      const exists = prev.some(item => item.destination.id === dest.id);
      if (exists) {
        // remove if already in
        return prev.filter(item => item.destination.id !== dest.id);
      } else {
        return [
          ...prev,
          {
            id: `stop-${Date.now()}`,
            destination: dest,
            days: 3,
            transitOption: dest.logisticsMode
          }
        ];
      }
    });
  };

  const handleRemoveFromItinerary = (stopId: string) => {
    setItinerary((prev) => prev.filter(item => item.id !== stopId));
  };

  const handleUpdateStopDays = (stopId: string, days: number) => {
    setItinerary((prev) =>
      prev.map(item => (item.id === stopId ? { ...item, days } : item))
    );
  };

  const handleFlyToDestination = (dest: Destination) => {
    setMapCenter(dest.coordinates);
    setMapZoom(7);
    setSelectedDestination(dest);
  };

  const handleFlyToUzbekPoint = (point: UzbekPoint) => {
    setMapCenter(point.coordinates);
    setMapZoom(13);
    setSelectedUzbekPoint(point);
    setShowUzbekLayer(true);
  };

  const handleSetCamera = (center: { lat: number; lng: number }, zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  const handleSelectTab = (tab: SidebarTab) => {
    setActiveTab(tab);
    setShowUzbekLayer(true);
    if (tab === 'hotels' || tab === 'sightseeing' || tab === 'hostels' || tab === 'airport_taxi') {
      setMapCenter({ lat: 40.2, lng: 65.5 });
      setMapZoom(6.8);
    }
  };

  const handleZoomToCityOrDistrict = (item: CityDistrictInfo) => {
    setActiveCityDistrict(item);
    setMapCenter(item.coordinates);
    setMapZoom(item.zoom);
    setShowUzbekLayer(true);
  };

  const handleClearActiveCityDistrict = () => {
    setActiveCityDistrict(null);
    setMapCenter({ lat: 40.2, lng: 65.5 });
    setMapZoom(6.8);
  };

  const handleResetFilters = () => {
    setFilter({
      searchQuery: '',
      selectedRegion: 'all',
      departureDate: '2026-10-10',
      returnDate: '2026-10-22',
      budgetRange: [30, 220],
      budgetTier: 'all',
      selectedCategories: [],
      selectedTransitModes: [],
      luggageForwardingOnly: false,
      maxTransitTimeHours: 12
    });
    setSelectedDestination(null);
    setSelectedUzbekPoint(null);
    setActiveCityDistrict(null);
    setMapCenter({ lat: 40.2, lng: 65.5 });
    setMapZoom(6.8);
  };

  const itineraryIds = useMemo(() => new Set(itinerary.map(i => i.destination.id)), [itinerary]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        itineraryCount={itinerary.length}
        matchedCount={filteredDestinations.length}
        onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
        onResetFilters={handleResetFilters}
      />

      {/* Main Split Layout: 60-65% Map on Left, 35-40% Filter Interface on Right */}
      <main className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Side: 60-65% Map Canvas */}
        <MapSection
          destinations={filteredDestinations}
          allDestinations={DESTINATIONS}
          selectedDestination={selectedDestination}
          onSelectDestination={setSelectedDestination}
          corridors={LOGISTICS_CORRIDORS}
          onAddToItinerary={handleAddToItinerary}
          itineraryIds={itineraryIds}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onSetCamera={handleSetCamera}
          showAllHubs={showAllHubs}
          onToggleShowAllHubs={() => setShowAllHubs(!showAllHubs)}
          uzbekPoints={UZBEKISTAN_POINTS}
          selectedUzbekPoint={selectedUzbekPoint}
          onSelectUzbekPoint={setSelectedUzbekPoint}
          showUzbekLayer={showUzbekLayer}
          onToggleUzbekLayer={() => setShowUzbekLayer(!showUzbekLayer)}
          activeCityDistrict={activeCityDistrict}
          onClearActiveCityDistrict={handleClearActiveCityDistrict}
        />

        {/* Right Side: 35-40% Filter & Itinerary Interface */}
        <FilterSidebar
          filter={filter}
          onFilterChange={setFilter}
          destinations={filteredDestinations}
          allDestinations={DESTINATIONS}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          selectedDestination={selectedDestination}
          onSelectDestination={setSelectedDestination}
          itinerary={itinerary}
          onAddToItinerary={handleAddToItinerary}
          onRemoveFromItinerary={handleRemoveFromItinerary}
          onUpdateStopDays={handleUpdateStopDays}
          onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
          onResetFilters={handleResetFilters}
          onFlyToDestination={handleFlyToDestination}
          selectedUzbekPoint={selectedUzbekPoint}
          onSelectUzbekPoint={setSelectedUzbekPoint}
          onFlyToUzbekPoint={handleFlyToUzbekPoint}
          activeCityDistrict={activeCityDistrict}
          onZoomToCityOrDistrict={handleZoomToCityOrDistrict}
        />
      </main>

      {/* Logistics Dispatch Sheet Modal */}
      <DispatchPlanModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        itinerary={itinerary}
        filter={filter}
      />
    </div>
  );
}
