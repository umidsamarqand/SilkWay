import { Compass, Luggage, Route, SlidersHorizontal, Building2, Eye, Bed, Car, UtensilsCrossed } from 'lucide-react';
import { SidebarTab } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  const { t } = useLanguage();

  return (
    <header className="h-16 bg-[#091124]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 md:px-6 flex items-center justify-between z-30 shrink-0 text-white">
      {/* Zone 1: Wordmark & Motto */}
      <div className="flex items-center gap-3">
        <a 
          href="/" 
          className="flex items-center gap-2.5 group"
          aria-label="Silk Way Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Compass className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">{t('brand.name', 'Silk Way')}</span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.2 rounded uppercase tracking-wider">
                {t('brand.country', 'Uzbekistan')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight line-clamp-1 max-w-[200px] sm:max-w-none">
              {t('brand.motto', 'experience uzbekistan effortlessly')}
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Clean nav links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-300">
        <button
          onClick={() => onSelectTab('hotels')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'hotels' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('nav.hotels', 'Hotels')}</span>
        </button>

        <button
          onClick={() => onSelectTab('restaurants')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'restaurants' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
          <span>{t('nav.restaurants', 'Restaurants')}</span>
        </button>

        <button
          onClick={() => onSelectTab('sightseeing')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'sightseeing' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-red-400" />
          <span>{t('nav.sightseeing', 'Sightseeing Places')}</span>
        </button>

        <button
          onClick={() => onSelectTab('hostels')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'hostels' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <Bed className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('nav.hostels', 'Hostels')}</span>
        </button>

        <button
          onClick={() => onSelectTab('airport_taxi')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'airport_taxi' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <Car className="w-3.5 h-3.5 text-yellow-400" />
          <span>{t('nav.taxis', 'Airport Taxis')}</span>
        </button>

        <button
          onClick={() => onSelectTab('filters')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'filters' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('nav.filters', 'Filters & Dates')}</span>
        </button>

        <button
          onClick={() => onSelectTab('itinerary')}
          className={`flex items-center gap-1.5 hover:text-white transition-colors py-1 ${
            activeTab === 'itinerary' ? 'text-amber-300 font-bold border-b-2 border-amber-400 -mb-[2px]' : ''
          }`}
        >
          <Route className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('nav.route', 'Route Plan')}</span>
          {itineraryCount > 0 && (
            <span className="font-mono text-[11px] text-amber-400 font-bold tabular-nums">
              ({itineraryCount})
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Language Switcher & Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <LanguageSwitcher />

        <button
          type="button"
          onClick={onResetFilters}
          className="hidden md:inline-flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors border border-slate-700/60"
        >
          {t('nav.resetFilters', 'Reset Filters')}
        </button>

        <button
          type="button"
          onClick={onOpenDispatchModal}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Luggage className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden xs:inline sm:inline">{t('nav.exportPlan', 'Export Plan')}</span>
          {itineraryCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-950 text-amber-300 rounded text-[10px] font-bold">
              {itineraryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
