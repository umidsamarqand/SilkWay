import React from 'react';
import { 
  FilterState, 
  ActivityCategory, 
  TransitMode, 
  Destination, 
  ItineraryStop,
  UzbekPoint,
  SidebarTab,
  CityDistrictInfo
} from '../types/travel';
import { CATEGORY_LABELS, TRANSIT_MODE_LABELS } from '../data/destinations';
import { UzbekistanPanel } from './UzbekistanPanel';
import { 
  Search, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  X, 
  Train, 
  Luggage, 
  ArrowRight,
  Plus,
  Trash2,
  Share2,
  Clock,
  Building2,
  Eye,
  Bed,
  Car,
  UtensilsCrossed
} from 'lucide-react';

interface FilterSidebarProps {
  filter: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  destinations: Destination[];
  allDestinations: Destination[];
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  itinerary: ItineraryStop[];
  onAddToItinerary: (dest: Destination) => void;
  onRemoveFromItinerary: (stopId: string) => void;
  onUpdateStopDays: (stopId: string, days: number) => void;
  onOpenDispatchModal: () => void;
  onResetFilters: () => void;
  onFlyToDestination: (dest: Destination) => void;
  selectedUzbekPoint: UzbekPoint | null;
  onSelectUzbekPoint: (point: UzbekPoint | null) => void;
  onFlyToUzbekPoint: (point: UzbekPoint) => void;
  activeCityDistrict?: CityDistrictInfo | null;
  onZoomToCityOrDistrict?: (item: CityDistrictInfo) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filter,
  onFilterChange,
  destinations,
  allDestinations,
  activeTab,
  onSelectTab,
  selectedDestination,
  onSelectDestination,
  itinerary,
  onAddToItinerary,
  onRemoveFromItinerary,
  onUpdateStopDays,
  onOpenDispatchModal,
  onResetFilters,
  onFlyToDestination,
  selectedUzbekPoint,
  onSelectUzbekPoint,
  onFlyToUzbekPoint,
  activeCityDistrict,
  onZoomToCityOrDistrict
}) => {
  // Compute trip duration in days
  const departure = new Date(filter.departureDate);
  const returnD = new Date(filter.returnDate);
  const tripDays = Math.max(1, Math.round((returnD.getTime() - departure.getTime()) / (1000 * 3600 * 24)));

  const regions = [
    { id: 'all', label: 'All Uzbekistan' },
    { id: 'samarkand', label: 'Samarkand' },
    { id: 'bukhara', label: 'Bukhara' },
    { id: 'khiva', label: 'Khiva' },
    { id: 'tashkent', label: 'Tashkent' },
    { id: 'zaamin', label: 'Mountains & Valleys' }
  ];

  const budgetTiers = [
    { id: 'all', label: 'Any Budget', range: [30, 250] },
    { id: 'budget', label: 'Backpacker ($30-$60)', range: [30, 60] },
    { id: 'comfort', label: 'Comfort ($60-$120)', range: [60, 120] },
    { id: 'premium', label: 'Silk Boutique ($120-$180)', range: [120, 180] },
    { id: 'luxury', label: 'VIP Executive ($180+)', range: [180, 250] }
  ];

  const toggleCategory = (cat: ActivityCategory) => {
    onFilterChange((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter(c => c !== cat)
          : [...prev.selectedCategories, cat]
      };
    });
  };

  const toggleTransitMode = (mode: TransitMode) => {
    onFilterChange((prev) => {
      const exists = prev.selectedTransitModes.includes(mode);
      return {
        ...prev,
        selectedTransitModes: exists
          ? prev.selectedTransitModes.filter(m => m !== mode)
          : [...prev.selectedTransitModes, mode]
      };
    });
  };

  const itineraryIds = new Set(itinerary.map(i => i.destination.id));

  // Total cost calculation for itinerary
  const totalItineraryCost = itinerary.reduce((acc, stop) => {
    const avgDaily = (stop.destination.dailyBudgetMin + stop.destination.dailyBudgetMax) / 2;
    return acc + avgDaily * stop.days;
  }, 0);

  const totalItineraryDays = itinerary.reduce((acc, stop) => acc + stop.days, 0);

  return (
    <div className="w-full lg:w-[38%] xl:w-[36%] h-full flex flex-col bg-white border-l border-slate-200 shadow-sm z-20">
      {/* Sidebar Header Tabs (1. Hotels, 2. Sightseeing Places, 3. Hostels, 4. Airport Taxis, etc.) */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/90 p-1.5 shrink-0 overflow-x-auto gap-1">
        {/* 1. Hotels */}
        <button
          onClick={() => onSelectTab('hotels')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hotels'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${activeTab === 'hotels' ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Hotels</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded tabular-nums ${activeTab === 'hotels' ? 'bg-slate-800 text-amber-300' : 'bg-slate-200/80 text-slate-600'}`}>
            13
          </span>
        </button>

        {/* 2. Restaurants */}
        <button
          onClick={() => onSelectTab('restaurants')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'restaurants'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <UtensilsCrossed className={`w-3.5 h-3.5 ${activeTab === 'restaurants' ? 'text-orange-400' : 'text-orange-600'}`} />
          <span>Restaurants</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded tabular-nums ${activeTab === 'restaurants' ? 'bg-slate-800 text-orange-300' : 'bg-slate-200/80 text-slate-600'}`}>
            11
          </span>
        </button>

        {/* 3. Sightseeing Places */}
        <button
          onClick={() => onSelectTab('sightseeing')}
          className={`flex-1 min-w-[136px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sightseeing'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Eye className={`w-3.5 h-3.5 ${activeTab === 'sightseeing' ? 'text-red-400' : 'text-red-600'}`} />
          <span>Sightseeing Places</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded tabular-nums ${activeTab === 'sightseeing' ? 'bg-slate-800 text-red-300' : 'bg-slate-200/80 text-slate-600'}`}>
            6
          </span>
        </button>

        {/* 4. Hostels */}
        <button
          onClick={() => onSelectTab('hostels')}
          className={`flex-1 min-w-[80px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hostels'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Bed className={`w-3.5 h-3.5 ${activeTab === 'hostels' ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span>Hostels</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded tabular-nums ${activeTab === 'hostels' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-200/80 text-slate-600'}`}>
            6
          </span>
        </button>

        {/* 5. Airport Taxis */}
        <button
          onClick={() => onSelectTab('airport_taxi')}
          className={`flex-1 min-w-[106px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'airport_taxi'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Car className={`w-3.5 h-3.5 ${activeTab === 'airport_taxi' ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <span>Airport Taxis</span>
          <span className={`text-[10px] font-mono px-1 py-0.2 rounded tabular-nums ${activeTab === 'airport_taxi' ? 'bg-slate-800 text-yellow-300' : 'bg-slate-200/80 text-slate-600'}`}>
            4
          </span>
        </button>

        {/* 6. Filters & Dates */}
        <button
          onClick={() => onSelectTab('filters')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'filters'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters</span>
        </button>

        {/* 7. Route */}
        <button
          onClick={() => onSelectTab('itinerary')}
          className={`flex-1 min-w-[74px] py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'itinerary'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Luggage className="w-3.5 h-3.5 text-slate-400" />
          <span>Route</span>
          {itinerary.length > 0 && (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold tabular-nums">
              {itinerary.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* 1. HOTELS */}
        {activeTab === 'hotels' && (
          <UzbekistanPanel
            activeSubtype="hotel"
            onChangeSubtype={(st) => {
              if (st === 'hotel') onSelectTab('hotels');
              else if (st === 'restaurant') onSelectTab('restaurants');
              else if (st === 'place_to_watch') onSelectTab('sightseeing');
              else if (st === 'hostel') onSelectTab('hostels');
              else if (st === 'airport_taxi') onSelectTab('airport_taxi');
            }}
            onFlyToPoint={onFlyToUzbekPoint}
            selectedPoint={selectedUzbekPoint}
            onSelectPoint={onSelectUzbekPoint}
            activeCityDistrict={activeCityDistrict}
            onZoomToCityOrDistrict={onZoomToCityOrDistrict}
          />
        )}

        {/* 2. RESTAURANTS */}
        {activeTab === 'restaurants' && (
          <UzbekistanPanel
            activeSubtype="restaurant"
            onChangeSubtype={(st) => {
              if (st === 'hotel') onSelectTab('hotels');
              else if (st === 'restaurant') onSelectTab('restaurants');
              else if (st === 'place_to_watch') onSelectTab('sightseeing');
              else if (st === 'hostel') onSelectTab('hostels');
              else if (st === 'airport_taxi') onSelectTab('airport_taxi');
            }}
            onFlyToPoint={onFlyToUzbekPoint}
            selectedPoint={selectedUzbekPoint}
            onSelectPoint={onSelectUzbekPoint}
            activeCityDistrict={activeCityDistrict}
            onZoomToCityOrDistrict={onZoomToCityOrDistrict}
          />
        )}

        {/* 3. SIGHTSEEING PLACES */}
        {activeTab === 'sightseeing' && (
          <UzbekistanPanel
            activeSubtype="place_to_watch"
            onChangeSubtype={(st) => {
              if (st === 'hotel') onSelectTab('hotels');
              else if (st === 'restaurant') onSelectTab('restaurants');
              else if (st === 'place_to_watch') onSelectTab('sightseeing');
              else if (st === 'hostel') onSelectTab('hostels');
              else if (st === 'airport_taxi') onSelectTab('airport_taxi');
            }}
            onFlyToPoint={onFlyToUzbekPoint}
            selectedPoint={selectedUzbekPoint}
            onSelectPoint={onSelectUzbekPoint}
            activeCityDistrict={activeCityDistrict}
            onZoomToCityOrDistrict={onZoomToCityOrDistrict}
          />
        )}

        {/* 4. HOSTELS */}
        {activeTab === 'hostels' && (
          <UzbekistanPanel
            activeSubtype="hostel"
            onChangeSubtype={(st) => {
              if (st === 'hotel') onSelectTab('hotels');
              else if (st === 'restaurant') onSelectTab('restaurants');
              else if (st === 'place_to_watch') onSelectTab('sightseeing');
              else if (st === 'hostel') onSelectTab('hostels');
              else if (st === 'airport_taxi') onSelectTab('airport_taxi');
            }}
            onFlyToPoint={onFlyToUzbekPoint}
            selectedPoint={selectedUzbekPoint}
            onSelectPoint={onSelectUzbekPoint}
            activeCityDistrict={activeCityDistrict}
            onZoomToCityOrDistrict={onZoomToCityOrDistrict}
          />
        )}

        {/* 5. AIRPORT TAXIS */}
        {activeTab === 'airport_taxi' && (
          <UzbekistanPanel
            activeSubtype="airport_taxi"
            onChangeSubtype={(st) => {
              if (st === 'hotel') onSelectTab('hotels');
              else if (st === 'restaurant') onSelectTab('restaurants');
              else if (st === 'place_to_watch') onSelectTab('sightseeing');
              else if (st === 'hostel') onSelectTab('hostels');
              else if (st === 'airport_taxi') onSelectTab('airport_taxi');
            }}
            onFlyToPoint={onFlyToUzbekPoint}
            selectedPoint={selectedUzbekPoint}
            onSelectPoint={onSelectUzbekPoint}
            activeCityDistrict={activeCityDistrict}
            onZoomToCityOrDistrict={onZoomToCityOrDistrict}
          />
        )}

        {/* 5. FILTERS */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            {/* 1. WHERE I WANNA GO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Where I Wanna Go
                </label>
                <span className="text-[11px] text-slate-500">Destination & Hub</span>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search destination, country, rail pass..."
                  value={filter.searchQuery}
                  onChange={(e) =>
                    onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                />
                {filter.searchQuery && (
                  <button
                    onClick={() => onFilterChange((prev) => ({ ...prev, searchQuery: '' }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Region Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {regions.map((reg) => {
                  const isActive = filter.selectedRegion === reg.id;
                  return (
                    <button
                      key={reg.id}
                      onClick={() =>
                        onFilterChange((prev) => ({ ...prev, selectedRegion: reg.id }))
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {reg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. TRAVEL DATES & DURATION */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Travel Dates
                </label>
                <span className="text-[11px] font-mono text-blue-600 font-semibold tabular-nums">
                  {tripDays} {tripDays === 1 ? 'day' : 'days'} duration
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2.5">
                <div>
                  <span className="text-[11px] text-slate-500 mb-1 block">Departure</span>
                  <input
                    type="date"
                    value={filter.departureDate}
                    onChange={(e) =>
                      onFilterChange((prev) => ({ ...prev, departureDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 mb-1 block">Return</span>
                  <input
                    type="date"
                    value={filter.returnDate}
                    onChange={(e) =>
                      onFilterChange((prev) => ({ ...prev, returnDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Quick Trip Duration Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: '4-day Weekend', days: 4 },
                  { label: '7-day Week', days: 7 },
                  { label: '14-day Expedition', days: 14 },
                  { label: '21-day Grand Tour', days: 21 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      const start = new Date(filter.departureDate || '2026-10-01');
                      const end = new Date(start);
                      end.setDate(end.getDate() + preset.days);
                      onFilterChange((prev) => ({
                        ...prev,
                        returnDate: end.toISOString().split('T')[0]
                      }));
                    }}
                    className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition-colors whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. BUDGET RANGE */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Daily Budget Range
                </label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  ${filter.budgetRange[0]} – ${filter.budgetRange[1]}/day
                </span>
              </div>

              {/* Range sliders */}
              <div className="space-y-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-12">Min/Day</span>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={filter.budgetRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onFilterChange((prev) => ({
                        ...prev,
                        budgetRange: [Math.min(val, prev.budgetRange[1] - 10), prev.budgetRange[1]],
                        budgetTier: 'all'
                      }));
                    }}
                    className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-xs w-12 text-right text-slate-700 tabular-nums">
                    ${filter.budgetRange[0]}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-12">Max/Day</span>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={filter.budgetRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onFilterChange((prev) => ({
                        ...prev,
                        budgetRange: [prev.budgetRange[0], Math.max(val, prev.budgetRange[0] + 10)],
                        budgetTier: 'all'
                      }));
                    }}
                    className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-xs w-12 text-right text-slate-700 tabular-nums">
                    ${filter.budgetRange[1]}
                  </span>
                </div>
              </div>

              {/* Total trip estimate box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Est. Total Trip Allocation</span>
                  <span className="text-xs text-slate-700">For {tripDays} days</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                    ${filter.budgetRange[0] * tripDays} – ${filter.budgetRange[1] * tripDays}
                  </span>
                </div>
              </div>

              {/* Budget Tier Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {budgetTiers.map((tier) => {
                  const isActive = filter.budgetTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() =>
                        onFilterChange((prev) => ({
                          ...prev,
                          budgetTier: tier.id as any,
                          budgetRange: tier.range as [number, number]
                        }))
                      }
                      className={`px-2.5 py-1.5 text-xs text-left font-medium rounded border transition-colors ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. PREFERRED ACTIVITY CATEGORIES */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Preferred Activity Categories
                </label>
                {filter.selectedCategories.length > 0 && (
                  <button
                    onClick={() =>
                      onFilterChange((prev) => ({ ...prev, selectedCategories: [] }))
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-900"
                  >
                    Clear ({filter.selectedCategories.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(CATEGORY_LABELS) as [ActivityCategory, { label: string; icon: string; desc: string }][]).map(
                  ([key, val]) => {
                    const isSelected = filter.selectedCategories.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCategory(key)}
                        className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs ring-1 ring-blue-600'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="text-base select-none">{val.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                            <span>{val.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {val.desc}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. LOGISTICS & TRANSIT MODE */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-blue-600" />
                  Logistics & Transit Mode
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {(Object.entries(TRANSIT_MODE_LABELS) as [TransitMode, { label: string; icon: string }][]).map(
                  ([mode, data]) => {
                    const isSelected = filter.selectedTransitModes.includes(mode);
                    return (
                      <button
                        key={mode}
                        onClick={() => toggleTransitMode(mode)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{data.icon}</span>
                        <span>{data.label}</span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Luggage forwarding toggle */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={filter.luggageForwardingOnly}
                  onChange={(e) =>
                    onFilterChange((prev) => ({
                      ...prev,
                      luggageForwardingOnly: e.target.checked
                    }))
                  }
                  className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hands-Free Luggage Forwarding Required</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Filter for hubs with Yamato, SBB Fly-Rail, or Porterage services
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: MATCHED DESTINATIONS ===================== */}
        {activeTab === 'destinations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matched Hubs ({destinations.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Sorted by logistics & filter fit
              </span>
            </div>

            {destinations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">No destinations match</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Try broadening your budget range or clearing selected categories.
                </p>
                <button
                  onClick={onResetFilters}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {destinations.map((dest) => {
                  const isSelected = selectedDestination?.id === dest.id;
                  const inItinerary = itineraryIds.has(dest.id);

                  return (
                    <div
                      key={dest.id}
                      onClick={() => {
                        onSelectDestination(dest);
                        onFlyToDestination(dest);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded">
                            {dest.rating} ★
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {dest.name}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-slate-900 shrink-0 ml-1 tabular-nums">
                              ${dest.dailyBudgetMin}–${dest.dailyBudgetMax}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1.5">
                            <span>{dest.country}</span>
                            <span>·</span>
                            <span>{CATEGORY_LABELS[dest.primaryCategory]?.label}</span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                            {dest.highlight}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {dest.transitTimeFromHub}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToItinerary(dest);
                              }}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors flex items-center gap-1 ${
                                inItinerary
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {inItinerary ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>In Plan</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Add Stop</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: LOGISTICS ITINERARY ===================== */}
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Logistics Dispatch Route
                </span>
                <span className="text-[11px] text-slate-500">
                  {itinerary.length} destinations · {totalItineraryDays} planned days
                </span>
              </div>
              {itinerary.length > 0 && (
                <button
                  onClick={onOpenDispatchModal}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Dispatch Sheet</span>
                </button>
              )}
            </div>

            {itinerary.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Luggage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">Your logistics route is empty</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Select destination hubs from the map or filter list to construct your connected transit itinerary.
                </p>
                <button
                  onClick={() => onSelectTab('destinations')}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Browse Matched Hubs
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Cost & Carbon Summary Card */}
                <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Estimated Total Trip Cost</span>
                    <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                      ${Math.round(totalItineraryCost).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
                    <span>Planned Duration</span>
                    <span className="font-mono tabular-nums">{totalItineraryDays} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Luggage Forwarding</span>
                    <span className="text-emerald-400 font-medium">Synchronized</span>
                  </div>
                </div>

                {/* Ordered Itinerary Stops */}
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {itinerary.map((stop, idx) => (
                    <div key={stop.id} className="relative group">
                      {/* Step Circle Indicator */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white shadow-xs">
                        {idx + 1}
                      </div>

                      <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{stop.destination.name}</h5>
                            <span className="text-[11px] text-slate-500">{stop.destination.country}</span>
                          </div>
                          <button
                            onClick={() => onRemoveFromItinerary(stop.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove Stop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                          <span className="font-medium text-slate-800">Transit connection: </span>
                          {stop.destination.transitTimeFromHub}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px] text-slate-600">Stay:</span>
                            <select
                              value={stop.days}
                              onChange={(e) => onUpdateStopDays(stop.id, Number(e.target.value))}
                              className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200 focus:outline-none"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                                <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => onFlyToDestination(stop.destination)}
                            className="text-[11px] text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <span>Map Pin</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent Bottom Action Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={onResetFilters}
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Reset Filters
        </button>

        <button
          onClick={() => {
            if (activeTab === 'hotels') onSelectTab('sightseeing');
            else if (activeTab === 'sightseeing') onSelectTab('hostels');
            else if (activeTab === 'hostels') onSelectTab('airport_taxi');
            else if (activeTab === 'airport_taxi') onSelectTab('itinerary');
            else if (activeTab === 'filters') onSelectTab('hotels');
            else onOpenDispatchModal();
          }}
          className="flex-1 py-2 px-4 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          {activeTab === 'hotels' ? (
            <>
              <span>Next: Sightseeing Places</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : activeTab === 'sightseeing' ? (
            <>
              <span>Next: Hostels & Backpacker Spots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : activeTab === 'hostels' ? (
            <>
              <span>Next: Airport Taxi Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : activeTab === 'airport_taxi' ? (
            <>
              <span>View Route Plan ({itinerary.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : activeTab === 'filters' ? (
            <>
              <span>Browse Uzbekistan Hotels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Export Logistics Manifest</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
