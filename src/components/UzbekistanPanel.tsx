import React, { useState, useMemo } from 'react';
import { UzbekPoint, UzbekPointType, TaxiBooking, CityDistrictInfo } from '../types/travel';
import { UZBEKISTAN_POINTS, INITIAL_TAXI_BOOKINGS, UZBEK_CITIES_AND_DISTRICTS } from '../data/uzbekistanData';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Bed, 
  Eye, 
  Car, 
  MapPin, 
  Phone, 
  Star, 
  Check, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  ArrowRight,
  ZoomIn,
  UtensilsCrossed,
  ArrowUpDown,
  Search,
  Filter,
  X
} from 'lucide-react';

interface UzbekistanPanelProps {
  onFlyToPoint: (point: UzbekPoint) => void;
  selectedPoint: UzbekPoint | null;
  onSelectPoint: (point: UzbekPoint | null) => void;
  activeSubtype?: UzbekPointType | 'all';
  onChangeSubtype?: (type: UzbekPointType | 'all') => void;
  activeCityDistrict?: CityDistrictInfo | null;
  onZoomToCityOrDistrict?: (item: CityDistrictInfo) => void;
  selectedCity?: string;
  selectedDistrictId?: string;
  onSelectDistrictId?: (id: string) => void;
}

const SERVICE_KEYS = ['pool', 'rooftop', 'breakfast', 'wifi', 'airport_shuttle', 'ac', 'cards', 'parking', 'spa', 'vegetarian'] as const;

const SERVICE_ICONS: Record<string, string> = {
  pool: '🏊',
  rooftop: '☕',
  breakfast: '🍳',
  wifi: '📶',
  airport_shuttle: '🚕',
  ac: '❄️',
  cards: '💳',
  parking: '🅿️',
  spa: '🧖',
  vegetarian: '🌿'
};

const CUISINE_KEYS = ['all', 'plov', 'shashlik', 'samsa', 'lagman', 'manti', 'tea', 'vegetarian'] as const;

export const UzbekistanPanel: React.FC<UzbekistanPanelProps> = ({
  onFlyToPoint,
  selectedPoint,
  onSelectPoint,
  activeSubtype: externalSubtype,
  onChangeSubtype,
  activeCityDistrict,
  onZoomToCityOrDistrict,
  selectedCity: externalCity,
  selectedDistrictId: externalDistrictId,
  onSelectDistrictId
}) => {
  const { t, language } = useLanguage();
  const [internalSubtype, setInternalSubtype] = useState<UzbekPointType | 'all'>('all');
  const activeSubtype = externalSubtype !== undefined ? externalSubtype : internalSubtype;
  const setActiveSubtype = (val: UzbekPointType | 'all') => {
    if (onChangeSubtype) {
      onChangeSubtype(val);
    } else {
      setInternalSubtype(val);
    }
  };

  const [internalCity, setInternalCity] = useState<string>('all');
  const activeCity = externalCity !== undefined ? externalCity : internalCity;

  const [internalDistrictId, setInternalDistrictId] = useState<string>(activeCityDistrict ? activeCityDistrict.id : 'all');
  const activeDistrictId = externalDistrictId !== undefined ? externalDistrictId : internalDistrictId;

  const [showTaxiModal, setShowTaxiModal] = useState<boolean>(false);
  const [bookings, setBookings] = useState<TaxiBooking[]>(INITIAL_TAXI_BOOKINGS);

  // New Filters & Ranking States
  const [selectedStar, setSelectedStar] = useState<number | 'all'>('all');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'stars' | 'price_low' | 'price_high'>('rating');

  const availableDistricts = activeCity === 'all'
    ? UZBEK_CITIES_AND_DISTRICTS.filter(d => d.isDistrict)
    : UZBEK_CITIES_AND_DISTRICTS.filter(d => d.isDistrict && d.cityName === activeCity);

  const handleSelectDistrict = (id: string, distObj?: (typeof UZBEK_CITIES_AND_DISTRICTS)[0]) => {
    if (onSelectDistrictId) {
      onSelectDistrictId(id);
    } else {
      setInternalDistrictId(id);
    }
    if (distObj && onZoomToCityOrDistrict) {
      onZoomToCityOrDistrict(distObj);
    } else if (id === 'all' && onZoomToCityOrDistrict) {
      const allObj = UZBEK_CITIES_AND_DISTRICTS.find(d => d.id === 'all');
      if (allObj) onZoomToCityOrDistrict(allObj);
    }
  };

  // Taxi Form State
  const [taxiForm, setTaxiForm] = useState({
    airport: 'Tashkent Airport (TAS)',
    dropoff: 'Lotte City Hotel Tashkent Palace',
    flightNumber: 'HY-101',
    passengerName: '',
    passengers: 2,
    luggageCount: 2,
    vehicleType: 'comfort_plus' as 'standard_sedan' | 'comfort_plus' | 'minivan_luggage' | 'business_vip',
    pickupTime: '2026-10-15 12:00'
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter and Rank items
  const filteredAndRankedPoints = useMemo(() => {
    const list = UZBEKISTAN_POINTS.filter((p) => {
      // 1. Subtype
      if (activeSubtype !== 'all' && p.type !== activeSubtype) return false;

      // 2. City
      if (activeCity !== 'all' && p.city !== activeCity) return false;

      // 3. District
      if (activeDistrictId !== 'all') {
        const activeDist = UZBEK_CITIES_AND_DISTRICTS.find(d => d.id === activeDistrictId);
        if (activeDist && activeDist.isDistrict) {
          const kw = activeDist.name.toLowerCase().split(' ')[0];
          const matches = 
            p.name.toLowerCase().includes(kw) || 
            (p.district && p.district.toLowerCase().includes(kw)) ||
            p.address.toLowerCase().includes(kw) || 
            p.description.toLowerCase().includes(kw) ||
            p.logisticsNote.toLowerCase().includes(kw);
          if (!matches) return false;
        }
      }

      // 4. Stars Filter (for hotels & restaurants)
      if (selectedStar !== 'all') {
        if (!p.stars || p.stars !== selectedStar) return false;
      }

      // 5. Services & Amenities Filter (all selected services must match)
      if (selectedServices.length > 0) {
        if (!p.services || !selectedServices.every(s => p.services?.includes(s))) {
          return false;
        }
      }

      // 6. Cuisine Filter (for restaurants)
      if (selectedCuisine !== 'all') {
        if (!p.cuisine || !p.cuisine.includes(selectedCuisine)) {
          return false;
        }
      }

      // 7. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesAddr = p.address.toLowerCase().includes(q);
        const matchesHigh = p.highlights.some(h => h.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAddr && !matchesHigh) {
          return false;
        }
      }

      return true;
    });

    // Sorting and Ranking
    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'popular') {
        return b.reviewsCount - a.reviewsCount;
      }
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (sortBy === 'price_low') {
        return (a.priceUsd || 0) - (b.priceUsd || 0);
      }
      if (sortBy === 'price_high') {
        return (b.priceUsd || 0) - (a.priceUsd || 0);
      }
      return 0;
    });

    return list;
  }, [activeSubtype, activeCity, activeDistrictId, selectedStar, selectedServices, selectedCuisine, searchQuery, sortBy]);

  const getSubtypeCount = (type: UzbekPointType) => {
    return UZBEKISTAN_POINTS.filter(p => p.type === type).length;
  };

  const getVehiclePrice = (type: string, airport: string) => {
    let base = 12;
    if (airport.includes('Urgench')) base = 16;
    if (airport.includes('Samarkand')) base = 10;
    if (airport.includes('Bukhara')) base = 8;

    switch (type) {
      case 'standard_sedan': return base;
      case 'comfort_plus': return base + 4;
      case 'minivan_luggage': return base + 8;
      case 'business_vip': return base + 22;
      default: return base;
    }
  };

  const currentPriceUsd = getVehiclePrice(taxiForm.vehicleType, taxiForm.airport);
  const currentPriceUzs = currentPriceUsd * 12800;

  const handleBookTaxi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxiForm.passengerName.trim()) {
      alert('Please enter passenger full name for the airport name sign.');
      return;
    }

    const newBooking: TaxiBooking = {
      id: `booking-${Date.now()}`,
      airport: taxiForm.airport,
      pickupLocation: 'Arrivals Gate Meeting Point (Driver holding name board)',
      dropoffLocation: taxiForm.dropoff,
      flightNumber: taxiForm.flightNumber || 'Scheduled',
      passengerName: taxiForm.passengerName,
      passengers: Number(taxiForm.passengers),
      luggageCount: Number(taxiForm.luggageCount),
      vehicleType: taxiForm.vehicleType,
      priceUsd: currentPriceUsd,
      priceUzs: currentPriceUzs,
      status: 'confirmed',
      driverName: 'Dilshod Karimov (Chevrolet Lacetti / Cobalt)',
      driverPhone: '+998 90 123 4567',
      pickupTime: taxiForm.pickupTime
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowTaxiModal(false);
    }, 2200);
  };

  return (
    <div className="space-y-4">
      {/* Uzbekistan Hero Banner */}
      <div className="p-4 bg-gradient-to-br from-[#0c1838] via-[#091124] to-[#1a0f35] text-white rounded-2xl relative overflow-hidden shadow-xl border border-amber-500/30 ring-1 ring-amber-400/20">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded shadow-xs">
              {t('brand.fullTagline', 'Silk Way · Experience Uzbekistan Effortlessly')}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {t('hero.activeDirectory', 'Full Country Directory Active')}
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-1 tracking-tight">
            {t('hero.title', 'Hotels, Hostels, Restaurants & Taxis')}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {t('hero.description', 'Experience Uzbekistan effortlessly: boutique hotels, gourmet restaurants, backpacker hostels, and official airport taxi transfers across Tashkent, Samarkand, Bukhara, Khiva, and Zaamin.')}
          </p>

          <button
            onClick={() => setShowTaxiModal(true)}
            className="w-full py-2.5 px-3 text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Car className="w-4 h-4 text-slate-950" />
            <span>{t('hero.bookTaxi', 'Book Meet & Greet Airport Taxi (Name Sign)')}</span>
          </button>
        </div>
      </div>

      {/* Historic Districts & Quarters of Active City */}
      <div className="p-3 bg-[#0c1838]/85 rounded-2xl border border-slate-800/80 shadow-md space-y-2 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {activeCity !== 'all' 
                ? `${t('location.keyDistricts', 'Historic Districts')}: ${activeCity}` 
                : t('location.allUzbekistan', 'All Uzbekistan Directory Active')}
            </span>
          </div>
          {activeDistrictId !== 'all' ? (
            <button
              type="button"
              onClick={() => handleSelectDistrict('all')}
              className="text-[10px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>{t('amenities.clear', 'Clear')} ✕</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">
              {availableDistricts.length > 0 ? `${availableDistricts.length} historic quarters` : t('hero.activeDirectory', 'Full Directory Active')}
            </span>
          )}
        </div>

        {availableDistricts.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {availableDistricts.map((dist) => {
              const isDistActive = activeDistrictId === dist.id;
              return (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => handleSelectDistrict(dist.id, dist)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                    isDistActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs ring-2 ring-amber-300'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{dist.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    · {dist.cityName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== RANK & FILTER TOOLBAR ===================== */}
      <div className="p-3.5 bg-[#0c1838]/85 rounded-2xl border border-slate-800/80 shadow-lg space-y-3 text-white">
        {/* Row 1: Search & Sorting Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder', 'Search by hotel name, dish, street, or feature...')}
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ranking / Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400 font-medium">{t('rank.label', 'Rank:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="rating" className="bg-slate-900 text-white">{t('rank.rating', '⭐ Highest Rated')}</option>
              <option value="popular" className="bg-slate-900 text-white">{t('rank.popular', '🔥 Most Popular')}</option>
              <option value="stars" className="bg-slate-900 text-white">{t('rank.stars', '✨ Stars (5★ to 3★)')}</option>
              <option value="price_low" className="bg-slate-900 text-white">{t('rank.priceLow', '💲 Price: Low to High')}</option>
              <option value="price_high" className="bg-slate-900 text-white">{t('rank.priceHigh', '💎 Price: High to Low')}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Star Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {t('stars.label', 'Stars:')}
          </span>
          {[
            { value: 'all', label: t('stars.all', 'All Stars') },
            { value: 5, label: t('stars.5', '⭐⭐⭐⭐⭐ 5-Star Luxury') },
            { value: 4, label: t('stars.4', '⭐⭐⭐⭐ 4-Star Boutique') },
            { value: 3, label: t('stars.3', '⭐⭐⭐ 3-Star Comfort') }
          ].map((starOpt) => {
            const isActive = selectedStar === starOpt.value;
            return (
              <button
                key={String(starOpt.value)}
                onClick={() => setSelectedStar(starOpt.value as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {starOpt.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Services & Amenities Filter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              {t('amenities.filterLabel', 'Filter by Services & Amenities:')}
            </span>
            {selectedServices.length > 0 && (
              <button
                onClick={() => setSelectedServices([])}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                {t('amenities.clear', 'Clear')} ({selectedServices.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_KEYS.map((srvKey) => {
              const isSelected = selectedServices.includes(srvKey);
              const label = t(`srv.${srvKey}`, srvKey);
              const icon = SERVICE_ICONS[srvKey] || '✨';
              return (
                <button
                  key={srvKey}
                  onClick={() => {
                    setSelectedServices(prev =>
                      isSelected ? prev.filter(s => s !== srvKey) : [...prev, srvKey]
                    );
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Cuisine Filter (If restaurants or all active) */}
        {(activeSubtype === 'restaurant' || activeSubtype === 'all') && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
              {t('cuisine.title', '🍲 Regional Cuisine Specialties:')}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CUISINE_KEYS.map((cKey) => {
                const isActive = selectedCuisine === cKey;
                const label = t(`cuisine.${cKey}`, cKey);
                return (
                  <button
                    key={cKey}
                    onClick={() => setSelectedCuisine(cKey)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white font-bold shadow-xs'
                        : 'bg-orange-950/40 text-orange-200 border border-orange-800/60 hover:bg-orange-900/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>
            {t('results.showing', 'Showing')} <strong className="text-white">{filteredAndRankedPoints.length}</strong> {t('results.verifiedSpots', 'verified spots')}
            {activeCity !== 'all' && ` ${t('results.inCity', 'in')} ${activeCity}`}
          </span>
          {(selectedStar !== 'all' || selectedServices.length > 0 || selectedCuisine !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStar('all');
                setSelectedServices([]);
                setSelectedCuisine('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              {t('nav.resetFilters', 'Reset Filters')}
            </button>
          )}
        </div>
      </div>

      {/* Active Airport Taxi Bookings Section */}
      {bookings.length > 0 && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/70 rounded-2xl space-y-2 text-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t('taxi.activePickups', 'Active Airport Pickups')} ({bookings.length})
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-700/60 px-2 py-0.5 rounded">
              {t('taxi.confirmed', 'Confirmed')}
            </span>
          </div>

          {bookings.map((b) => (
            <div key={b.id} className="p-2.5 bg-slate-900/90 rounded-xl border border-emerald-900/60 text-xs space-y-1 text-white">
              <div className="flex items-center justify-between font-bold text-white">
                <span>{b.passengerName} ({t('taxi.flight', 'Flight')} {b.flightNumber})</span>
                <span className="font-mono text-emerald-400">${b.priceUsd} USD</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{b.airport} → {b.dropoffLocation}</span>
                <span>{b.passengers} {t('taxi.pax', 'Pax')} · {b.luggageCount} {t('taxi.bags', 'Bags')}</span>
              </div>
              <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">{t('taxi.driver', 'Driver:')} <strong className="text-white">{b.driverName}</strong></span>
                <span className="font-mono text-amber-400">{b.driverPhone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards List for Filtered & Ranked Points */}
      <div className="space-y-3">
        {filteredAndRankedPoints.length === 0 ? (
          <div className="p-8 text-center bg-[#0c1838]/85 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <Search className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">{t('results.noMatches', 'No spots match your exact filter')}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('results.noMatchesDesc', 'Try adjusting your star ratings, services, or cuisine choices to discover more spots across Uzbekistan.')}
            </p>
            <button
              onClick={() => {
                setSelectedStar('all');
                setSelectedServices([]);
                setSelectedCuisine('all');
                setSearchQuery('');
                handleSelectDistrict('all');
              }}
              className="mt-2 px-3 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 shadow-md shadow-amber-500/20"
            >
              {t('results.resetAll', 'Reset All Filters')}
            </button>
          </div>
        ) : (
          filteredAndRankedPoints.map((point) => {
            const isSelected = selectedPoint?.id === point.id;

            return (
              <div
                key={point.id}
                onClick={() => {
                  onSelectPoint(point);
                  onFlyToPoint(point);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-amber-400 bg-[#0f1f47] shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
                    : 'border-slate-800/90 bg-[#0c1838]/85 hover:border-amber-400/60 hover:shadow-lg hover:shadow-black/30'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                    <img
                      src={point.imageUrl}
                      alt={point.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-950/85 text-white text-[9px] font-bold rounded">
                      {point.city}
                    </div>

                    {point.stars && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-extrabold rounded flex items-center gap-0.5 shadow-xs">
                        <span>{point.stars}★</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="text-xs font-bold text-white line-clamp-1">
                        {point.name}
                      </h5>
                      {point.priceUsd !== undefined && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                            ${point.priceUsd}
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            {point.type === 'hotel' || point.type === 'hostel' 
                              ? t('results.night', '/night')
                              : point.type === 'restaurant'
                              ? t('results.avgMeal', ' avg meal')
                              : point.type === 'airport_taxi'
                              ? t('results.fare', ' fare')
                              : t('results.entry', ' entry')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata line: Stars, Category, Rating */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="capitalize font-semibold text-amber-300">
                        {point.type === 'place_to_watch' 
                          ? t('results.spotType.mustSee', 'Must-See Spot')
                          : point.type === 'restaurant'
                          ? t('results.spotType.restaurant', '🍽️ Uzbek Restaurant')
                          : point.type === 'hotel'
                          ? `🏨 ${point.stars || 4}★ ${t('results.spotType.hotel', 'Star Hotel')}`
                          : point.type === 'hostel'
                          ? t('results.spotType.hostel', '🛏️ Backpacker Hostel')
                          : t('results.spotType.taxi', '🚕 Airport Taxi')}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                        {point.rating}
                      </span>
                      <span className="text-slate-400 text-[10px]">({point.reviewsCount} {t('results.reviews', 'reviews')})</span>

                      {point.district && (
                        <>
                          <span>·</span>
                          <span className="text-amber-200 font-medium text-[10px] bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            {point.district}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                      {point.description}
                    </p>

                    {/* Services and Amenities Badges */}
                    {point.services && point.services.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none">
                        {point.services.map((srvKey) => {
                          const label = t(`srv.${srvKey}`, srvKey);
                          const icon = SERVICE_ICONS[srvKey] || '✨';
                          return (
                            <span
                              key={srvKey}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-900/90 border border-slate-700/60 text-slate-200 text-[10px] font-medium rounded-md whitespace-nowrap shrink-0"
                            >
                              <span>{icon}</span>
                              <span>{label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Cuisine Tags for Restaurants */}
                    {point.cuisine && point.cuisine.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none">
                        {point.cuisine.map((cKey) => (
                          <span
                            key={cKey}
                            className="inline-flex items-center px-1.5 py-0.5 bg-orange-950/40 text-orange-300 text-[10px] font-semibold rounded-md whitespace-nowrap shrink-0 border border-orange-800/60"
                          >
                            #{cKey.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-2 bg-slate-900/90 rounded-lg text-[11px] text-slate-300 mb-2 border border-slate-800">
                      <strong className="text-amber-300">Logistics & Tips:</strong> {point.logisticsNote}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mt-1">
                      <span className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-[180px]" title={point.address}>
                        📍 {point.address}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPoint(point);
                          onFlyToPoint(point);
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span className="whitespace-nowrap">{t('results.showOnMap', 'Show on Map')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Airport Taxi Booking Modal */}
      {showTaxiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <Car className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">{t('taxiModal.title', 'Book Uzbekistan Airport Pickup')}</h4>
                  <p className="text-xs text-slate-500">{t('taxiModal.subtitle', 'Official airport driver with personalized name tablet at arrivals')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTaxiModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">{t('taxiModal.successTitle', 'Airport Pickup Confirmed!')}</h4>
                <p className="text-xs text-emerald-800">
                  {t('taxiModal.successDesc', 'Your chauffeur has received flight details and will await you with your personalized name board at the exit gate.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookTaxi} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldAirport', 'Arrival Airport')}</label>
                  <select
                    value={taxiForm.airport}
                    onChange={(e) => setTaxiForm({ ...taxiForm, airport: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Tashkent Airport (TAS)">Islam Karimov Tashkent International Airport (TAS)</option>
                    <option value="Samarkand Airport (SKD)">Samarkand International Airport (SKD)</option>
                    <option value="Bukhara Airport (BHK)">Bukhara International Airport (BHK)</option>
                    <option value="Urgench Airport (UGC) - to Khiva">Urgench International Airport (UGC) - To Khiva Citadel (30 km)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldName', 'Passenger Name (for Airport Name Sign)')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Smith"
                    value={taxiForm.passengerName}
                    onChange={(e) => setTaxiForm({ ...taxiForm, passengerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldFlight', 'Flight Number')}</label>
                    <input
                      type="text"
                      placeholder="e.g. HY-232 / TK-368"
                      value={taxiForm.flightNumber}
                      onChange={(e) => setTaxiForm({ ...taxiForm, flightNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldTime', 'Landing Date & Time')}</label>
                    <input
                      type="text"
                      value={taxiForm.pickupTime}
                      onChange={(e) => setTaxiForm({ ...taxiForm, pickupTime: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldDropoff', 'Hotel or Drop-off Address')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lotte Palace Tashkent / Hotel Grand Samarkand"
                    value={taxiForm.dropoff}
                    onChange={(e) => setTaxiForm({ ...taxiForm, dropoff: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldVehicle', 'Vehicle Class')}</label>
                    <select
                      value={taxiForm.vehicleType}
                      onChange={(e) => setTaxiForm({ ...taxiForm, vehicleType: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="standard_sedan">{t('vehicle.standard', 'Standard Sedan (Cobalt)')}</option>
                      <option value="comfort_plus">{t('vehicle.comfort', 'Comfort Plus (Lacetti)')}</option>
                      <option value="minivan_luggage">{t('vehicle.minivan', 'Minivan (Hyundai H1)')}</option>
                      <option value="business_vip">{t('vehicle.vip', 'VIP Executive (Malibu/Merc)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldPax', 'Passengers')}</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={taxiForm.passengers}
                      onChange={(e) => setTaxiForm({ ...taxiForm, passengers: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('taxiModal.fieldLuggage', 'Luggage Bags')}</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={taxiForm.luggageCount}
                      onChange={(e) => setTaxiForm({ ...taxiForm, luggageCount: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">{t('taxiModal.pricingSummary', 'Total Guaranteed Tariff')}</span>
                    <strong className="text-sm font-mono text-emerald-800">${currentPriceUsd} USD</strong>
                    <span className="text-[10px] text-slate-500 ml-1">({currentPriceUzs.toLocaleString()} UZS)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Free Cancellation
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {t('taxiModal.confirmButton', 'Confirm & Dispatch Airport Chauffeur')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
