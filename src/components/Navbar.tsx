import { Compass, Luggage, MapPin, Route, SlidersHorizontal, Building2, Eye, Bed, Car, UtensilsCrossed } from 'lucide-react';
import { SidebarTab } from '../types/travel';

interface NavbarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  itineraryCount: number;
  matchedCount: number;
  onOpenDispatchModal: () => void;
  onResetFilters: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  itineraryCount,
  matchedCount,
  onOpenDispatchModal,
  onResetFilters
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="/" 
          className="text-lg md:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"
          aria-label="VentureWay Homepage"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold text-slate-950">VentureWay</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1.5 border-l border-slate-200">
            Uzbekistan
          </span>
        </a>
      </div>

      {/* Zone 2: Clean nav links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => onSelectTab('hotels')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'hotels' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Hotels</span>
        </button>

        <button
          onClick={() => onSelectTab('restaurants')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'restaurants' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
          <span>Restaurants</span>
        </button>

        <button
          onClick={() => onSelectTab('sightseeing')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'sightseeing' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-red-600" />
          <span>Sightseeing Places</span>
        </button>

        <button
          onClick={() => onSelectTab('hostels')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'hostels' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <Bed className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hostels</span>
        </button>

        <button
          onClick={() => onSelectTab('airport_taxi')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'airport_taxi' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <Car className="w-3.5 h-3.5 text-yellow-600" />
          <span>Airport Taxis</span>
        </button>

        <button
          onClick={() => onSelectTab('filters')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'filters' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters & Dates</span>
        </button>

        <button
          onClick={() => onSelectTab('itinerary')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 ${
            activeTab === 'itinerary' ? 'text-slate-950 font-bold border-b-2 border-slate-950 -mb-[2px]' : ''
          }`}
        >
          <Route className="w-3.5 h-3.5 text-slate-500" />
          <span>Route Plan</span>
          {itineraryCount > 0 && (
            <span className="font-mono text-[11px] text-emerald-700 font-bold tabular-nums">
              ({itineraryCount})
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onResetFilters}
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          Reset Filters
        </button>

        <button
          type="button"
          onClick={onOpenDispatchModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Luggage className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Plan</span>
          {itineraryCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded text-[10px] font-bold">
              {itineraryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
