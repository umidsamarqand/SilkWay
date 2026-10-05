import React from 'react';
import { 
  Compass, 
  Luggage, 
  Building2, 
  UtensilsCrossed, 
  Eye, 
  Bed, 
  Car, 
  SlidersHorizontal,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { SidebarTab } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UZBEKISTAN_POINTS } from '../data/uzbekistanData';

interface NavbarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  itineraryCount: number;
  matchedCount: number;
  onOpenDispatchModal: () => void;
  onResetFilters: () => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  itineraryCount,
  matchedCount,
  onOpenDispatchModal,
  onResetFilters,
  selectedCity = 'all',
  onSelectCity
}) => {
  const { t } = useLanguage();

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'hotels',
      label: t('nav.hotels', 'Hotels'),
      icon: <Building2 className="w-3.5 h-3.5 shrink-0" />,
      count: UZBEKISTAN_POINTS.filter(p => p.type === 'hotel' && (selectedCity === 'all' || p.city === selectedCity)).length
    },
    {
      id: 'restaurants',
      label: t('nav.restaurants', 'Restaurants'),
      icon: <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />,
      count: UZBEKISTAN_POINTS.filter(p => p.type === 'restaurant' && (selectedCity === 'all' || p.city === selectedCity)).length
    },
    {
      id: 'sightseeing',
      label: t('nav.sightseeing', 'Sightseeing'),
      icon: <Eye className="w-3.5 h-3.5 shrink-0" />,
      count: UZBEKISTAN_POINTS.filter(p => p.type === 'place_to_watch' && (selectedCity === 'all' || p.city === selectedCity)).length
    },
    {
      id: 'hostels',
      label: t('nav.hostels', 'Hostels'),
      icon: <Bed className="w-3.5 h-3.5 shrink-0" />,
      count: UZBEKISTAN_POINTS.filter(p => p.type === 'hostel' && (selectedCity === 'all' || p.city === selectedCity)).length
    },
    {
      id: 'airport_taxi',
      label: t('nav.taxis', 'Airport Taxis'),
      icon: <Car className="w-3.5 h-3.5 shrink-0" />,
      count: UZBEKISTAN_POINTS.filter(p => p.type === 'airport_taxi' && (selectedCity === 'all' || p.city === selectedCity)).length
    },
    {
      id: 'filters',
      label: t('nav.filters', 'Filters'),
      icon: <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
    },
    {
      id: 'itinerary',
      label: t('nav.route', 'Route Plan'),
      icon: <Luggage className="w-3.5 h-3.5 shrink-0" />,
      count: itineraryCount > 0 ? itineraryCount : undefined
    }
  ];

  const cities = [
    { id: 'all', label: t('location.city.all', 'All Uzbekistan') },
    { id: 'Samarkand', label: `🏛️ ${t('location.city.samarkand', 'Samarkand')}` },
    { id: 'Bukhara', label: `🕌 ${t('location.city.bukhara', 'Bukhara')}` },
    { id: 'Khiva', label: `🏰 ${t('location.city.khiva', 'Khiva')}` },
    { id: 'Tashkent', label: `🏙️ ${t('location.city.tashkent', 'Tashkent')}` },
    { id: 'Zaamin', label: `🏔️ ${t('location.city.zaamin', 'Zaamin')}` }
  ];

  return (
    <header className="bg-[#091124]/95 backdrop-blur-md border-b border-slate-800/80 z-30 shrink-0 text-white shadow-xl flex flex-col">
      {/* Primary Top Row */}
      <div className="h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Zone 1: Wordmark & Motto */}
        <div className="flex items-center gap-3 shrink-0">
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
              <span className="text-[10px] text-slate-400 font-medium tracking-tight line-clamp-1 hidden sm:block max-w-[200px] lg:max-w-none">
                {t('brand.motto', 'experience uzbekistan effortlessly')}
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: The Universal Navigation Bar (Visible on md+) */}
        <nav 
          className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1.5 bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-inner"
          role="tablist"
          aria-label="Silk Way Universal Directory Navigator"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`shrink-0 px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-300/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                role="tab"
                aria-selected={isActive}
              >
                {tab.icon}
                <span className="font-semibold">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold tabular-nums ${
                    isActive 
                      ? 'bg-slate-950 text-amber-300' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Universal City Selector & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Universal City Selector */}
          {onSelectCity && (
            <div className="relative flex items-center">
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 hover:border-amber-400/50 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs transition-colors shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1 appearance-none"
                  aria-label="Select City Filter"
                >
                  {cities.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
              </div>
            </div>
          )}

          <LanguageSwitcher />

          <button
            type="button"
            onClick={onResetFilters}
            className="hidden xl:inline-flex px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors border border-slate-700/60"
            title={t('nav.resetFilters', 'Reset Filters')}
          >
            {t('nav.resetFilters', 'Reset')}
          </button>

          <button
            type="button"
            onClick={onOpenDispatchModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Luggage className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{t('nav.exportPlan', 'Export Plan')}</span>
            {itineraryCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-950 text-amber-300 rounded text-[10px] font-bold">
                {itineraryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tier: The Universal Navigation Bar for Small Screens (< md) */}
      <nav 
        className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none px-2.5 py-1.5 border-t border-slate-800/80 bg-[#070e20] shadow-inner"
        role="tablist"
        aria-label="Silk Way Mobile Navigation"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`shrink-0 px-2.5 py-1 text-xs rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon}
              <span className="font-semibold">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold tabular-nums ${
                  isActive 
                    ? 'bg-slate-950 text-amber-300' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
