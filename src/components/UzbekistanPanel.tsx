import React, { useState, useMemo } from 'react';
import { UzbekPoint, UzbekPointType, TaxiBooking, CityDistrictInfo } from '../types/travel';
import { UZBEKISTAN_POINTS, INITIAL_TAXI_BOOKINGS, UZBEK_CITIES_AND_DISTRICTS } from '../data/uzbekistanData';
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
}

const SERVICE_META: Record<string, { label: string; icon: string }> = {
  pool: { label: 'Pool', icon: '🏊' },
  rooftop: { label: 'Rooftop', icon: '☕' },
  breakfast: { label: 'Breakfast', icon: '🍳' },
  wifi: { label: 'Free WiFi', icon: '📶' },
  airport_shuttle: { label: 'Airport Shuttle', icon: '🚕' },
  ac: { label: 'AC', icon: '❄️' },
  cards: { label: 'Cards Accepted', icon: '💳' },
  parking: { label: 'Parking', icon: '🅿️' },
  spa: { label: 'Spa / Hamam', icon: '🧖' },
  vegetarian: { label: 'Vegetarian Options', icon: '🌿' }
};

const CUISINE_OPTIONS = [
  { id: 'all', label: 'All Cuisines' },
  { id: 'plov', label: 'Silk Road Plov' },
  { id: 'shashlik', label: 'Charcoal Shashlik' },
  { id: 'samsa', label: 'Tandir Samsa' },
  { id: 'lagman', label: 'Lagman Noodles' },
  { id: 'manti', label: 'Steamed Manti' },
  { id: 'tea', label: 'Teahouse & Sweets' },
  { id: 'vegetarian', label: 'Vegetarian Friendly' }
];

export const UzbekistanPanel: React.FC<UzbekistanPanelProps> = ({
  onFlyToPoint,
  selectedPoint,
  onSelectPoint,
  activeSubtype: externalSubtype,
  onChangeSubtype,
  activeCityDistrict,
  onZoomToCityOrDistrict
}) => {
  const [internalSubtype, setInternalSubtype] = useState<UzbekPointType | 'all'>('all');
  const activeSubtype = externalSubtype !== undefined ? externalSubtype : internalSubtype;
  const setActiveSubtype = (val: UzbekPointType | 'all') => {
    if (onChangeSubtype) {
      onChangeSubtype(val);
    } else {
      setInternalSubtype(val);
    }
  };

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(activeCityDistrict ? activeCityDistrict.id : 'all');
  const [showTaxiModal, setShowTaxiModal] = useState<boolean>(false);
  const [bookings, setBookings] = useState<TaxiBooking[]>(INITIAL_TAXI_BOOKINGS);

  // New Filters & Ranking States
  const [selectedStar, setSelectedStar] = useState<number | 'all'>('all');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'stars' | 'price_low' | 'price_high'>('rating');

  const mainCities = UZBEK_CITIES_AND_DISTRICTS.filter(d => !d.isDistrict);
  const availableDistricts = selectedCity === 'all'
    ? UZBEK_CITIES_AND_DISTRICTS.filter(d => d.isDistrict)
    : UZBEK_CITIES_AND_DISTRICTS.filter(d => d.isDistrict && d.cityName === selectedCity);

  const handleSelectLocation = (loc: (typeof UZBEK_CITIES_AND_DISTRICTS)[0]) => {
    setSelectedDistrictId(loc.id);
    if (loc.id === 'all') {
      setSelectedCity('all');
    } else {
      setSelectedCity(loc.cityName);
    }
    if (onZoomToCityOrDistrict) {
      onZoomToCityOrDistrict(loc);
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
      if (selectedCity !== 'all' && p.city !== selectedCity) return false;

      // 3. District
      if (selectedDistrictId !== 'all') {
        const activeDist = UZBEK_CITIES_AND_DISTRICTS.find(d => d.id === selectedDistrictId);
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
  }, [activeSubtype, selectedCity, selectedDistrictId, selectedStar, selectedServices, selectedCuisine, searchQuery, sortBy]);

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
      <div className="p-4 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
              Uzbekistan Tourism & Gastronomy
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Full Country Directory Active
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            Hotels, Hostels, Restaurants & Taxis
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Ranked and filtered by services, amenities, and star ratings across Tashkent, Samarkand, Bukhara, Khiva, and Zaamin.
          </p>

          <button
            onClick={() => setShowTaxiModal(true)}
            className="w-full py-2 px-3 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Car className="w-4 h-4 text-slate-950" />
            <span>Book Airport Taxi Pickup (Name Sign Included)</span>
          </button>
        </div>
      </div>

      {/* Sub-Category Segmented Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
        {/* 1. Hotels */}
        <button
          onClick={() => setActiveSubtype('hotel')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubtype === 'hotel'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Hotels ({getSubtypeCount('hotel')})</span>
        </button>

        {/* 2. Restaurants */}
        <button
          onClick={() => setActiveSubtype('restaurant')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubtype === 'restaurant'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
          <span>Restaurants ({getSubtypeCount('restaurant')})</span>
        </button>

        {/* 3. Hostels */}
        <button
          onClick={() => setActiveSubtype('hostel')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubtype === 'hostel'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bed className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hostels ({getSubtypeCount('hostel')})</span>
        </button>

        {/* 4. Places to Watch */}
        <button
          onClick={() => setActiveSubtype('place_to_watch')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubtype === 'place_to_watch'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-red-600" />
          <span>Sightseeing ({getSubtypeCount('place_to_watch')})</span>
        </button>

        {/* 5. Airport Taxis */}
        <button
          onClick={() => setActiveSubtype('airport_taxi')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
            activeSubtype === 'airport_taxi'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-yellow-600" />
          <span>Taxis ({getSubtypeCount('airport_taxi')})</span>
        </button>
      </div>

      {/* City & District Interactive Zoom & Mark Selector */}
      <div className="p-3 bg-slate-50/95 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Select City or District to Zoom & Mark</span>
          </div>
          {selectedDistrictId !== 'all' ? (
            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              <span>Marked & Zoomed</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <ZoomIn className="w-3 h-3 text-slate-400" />
              <span>Click to fly & pinpoint</span>
            </span>
          )}
        </div>

        {/* 1. Main City Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {mainCities.map((city) => {
            const isSelected = selectedCity === city.cityName && (selectedDistrictId === 'all' || selectedDistrictId === city.id);
            return (
              <button
                key={city.id}
                onClick={() => handleSelectLocation(city)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{city.name}</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {city.cityName === 'all' 
                    ? UZBEKISTAN_POINTS.length 
                    : UZBEKISTAN_POINTS.filter(p => p.city === city.cityName).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Historic Districts & Quarters Pills */}
        {availableDistricts.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1">
                <span>📍 Key Historic Districts & Quarters:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Tap to zoom 15x
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {availableDistricts.map((dist) => {
                const isDistActive = selectedDistrictId === dist.id;
                return (
                  <button
                    key={dist.id}
                    onClick={() => handleSelectLocation(dist)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                      isDistActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border border-amber-200/80 hover:bg-amber-50/60'
                    }`}
                  >
                    <span>{dist.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      · {dist.cityName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===================== RANK & FILTER TOOLBAR ===================== */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search & Sorting Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hotel name, dish, street, or feature..."
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ranking / Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-500 font-medium">Rank by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="popular">🔥 Most Popular</option>
              <option value="stars">✨ Stars (5★ to 3★)</option>
              <option value="price_low">💲 Price: Low to High</option>
              <option value="price_high">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: Star Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            Stars:
          </span>
          {[
            { value: 'all', label: 'All Stars' },
            { value: 5, label: '⭐⭐⭐⭐⭐ 5-Star Luxury' },
            { value: 4, label: '⭐⭐⭐⭐ 4-Star Boutique' },
            { value: 3, label: '⭐⭐⭐ 3-Star Comfort' }
          ].map((starOpt) => {
            const isActive = selectedStar === starOpt.value;
            return (
              <button
                key={String(starOpt.value)}
                onClick={() => setSelectedStar(starOpt.value as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Filter by Services & Amenities:
            </span>
            {selectedServices.length > 0 && (
              <button
                onClick={() => setSelectedServices([])}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear ({selectedServices.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {Object.entries(SERVICE_META).map(([srvKey, srv]) => {
              const isSelected = selectedServices.includes(srvKey);
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
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  <span>{srv.icon}</span>
                  <span>{srv.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Cuisine Filter (If restaurants or all active) */}
        {(activeSubtype === 'restaurant' || activeSubtype === 'all') && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              🍲 Regional Cuisine Specialties:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CUISINE_OPTIONS.map((c) => {
                const isActive = selectedCuisine === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCuisine(c.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredAndRankedPoints.length}</strong> verified spots
            {selectedCity !== 'all' && ` in ${selectedCity}`}
          </span>
          {(selectedStar !== 'all' || selectedServices.length > 0 || selectedCuisine !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStar('all');
                setSelectedServices([]);
                setSelectedCuisine('all');
                setSearchQuery('');
              }}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Airport Taxi Bookings Section */}
      {bookings.length > 0 && (
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active Airport Pickups ({bookings.length})
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Confirmed
            </span>
          </div>

          {bookings.map((b) => (
            <div key={b.id} className="p-2.5 bg-white rounded-lg border border-emerald-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{b.passengerName} (Flight {b.flightNumber})</span>
                <span className="font-mono text-emerald-700">${b.priceUsd} USD</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>{b.airport} → {b.dropoffLocation}</span>
                <span>{b.passengers} Pax · {b.luggageCount} Bags</span>
              </div>
              <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Assigned Driver: <strong>{b.driverName}</strong></span>
                <span className="font-mono text-blue-600">{b.driverPhone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards List for Filtered & Ranked Points */}
      <div className="space-y-3">
        {filteredAndRankedPoints.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No spots match your exact filter</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your star ratings, services, or cuisine choices to discover more spots across Uzbekistan.
            </p>
            <button
              onClick={() => {
                setSelectedStar('all');
                setSelectedServices([]);
                setSelectedCuisine('all');
                setSearchQuery('');
                setSelectedCity('all');
                setSelectedDistrictId('all');
              }}
              className="mt-2 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Reset All Filters
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
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                    <img
                      src={point.imageUrl}
                      alt={point.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-950/80 text-white text-[9px] font-bold rounded">
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
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {point.name}
                      </h5>
                      {point.priceUsd !== undefined && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-800 tabular-nums">
                            ${point.priceUsd}
                          </span>
                          <span className="text-[10px] text-slate-500 block -mt-0.5">
                            {point.type === 'hotel' || point.type === 'hostel' 
                              ? '/night' 
                              : point.type === 'restaurant'
                              ? ' avg meal'
                              : point.type === 'airport_taxi'
                              ? ' fare'
                              : ' entry'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata line: Stars, Category, Rating */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="capitalize font-semibold text-slate-800">
                        {point.type === 'place_to_watch' 
                          ? 'Must-See Spot' 
                          : point.type === 'restaurant'
                          ? '🍽️ Uzbek Restaurant'
                          : point.type === 'hotel'
                          ? `🏨 ${point.stars || 4}-Star Hotel`
                          : point.type === 'hostel'
                          ? '🛏️ Backpacker Hostel'
                          : '🚕 Airport Taxi'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                        {point.rating}
                      </span>
                      <span className="text-slate-400 text-[10px]">({point.reviewsCount} reviews)</span>

                      {point.district && (
                        <>
                          <span>·</span>
                          <span className="text-blue-700 font-medium text-[10px] bg-blue-50 px-1.5 py-0.2 rounded">
                            {point.district}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                      {point.description}
                    </p>

                    {/* Services and Amenities Badges */}
                    {point.services && point.services.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none">
                        {point.services.map((srvKey) => {
                          const meta = SERVICE_META[srvKey];
                          if (!meta) return null;
                          return (
                            <span
                              key={srvKey}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md whitespace-nowrap shrink-0"
                            >
                              <span>{meta.icon}</span>
                              <span>{meta.label}</span>
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
                            className="inline-flex items-center px-1.5 py-0.5 bg-orange-50 text-orange-800 text-[10px] font-semibold rounded-md whitespace-nowrap shrink-0 border border-orange-200/60"
                          >
                            #{cKey.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 mb-2 border border-slate-100">
                      <strong className="text-slate-900">Logistics & Tips:</strong> {point.logisticsNote}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                        {point.address}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFlyToPoint(point);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Pin on Map</span>
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
                  <h4 className="text-sm font-bold text-slate-950">Book Uzbekistan Airport Pickup</h4>
                  <p className="text-xs text-slate-500">Official airport driver with personalized name tablet at arrivals</p>
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
                <h4 className="text-sm font-bold text-emerald-950">Airport Pickup Confirmed!</h4>
                <p className="text-xs text-emerald-800">
                  Your driver <strong>Dilshod Karimov</strong> will meet you at the arrivals gate with your name board.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookTaxi} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Arrival Airport</label>
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
                  <label className="font-semibold text-slate-700 block mb-1">Passenger Name (for Airport Name Sign)</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">Flight Number</label>
                    <input
                      type="text"
                      placeholder="e.g. HY-232 / TK-368"
                      value={taxiForm.flightNumber}
                      onChange={(e) => setTaxiForm({ ...taxiForm, flightNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Landing Date & Time</label>
                    <input
                      type="text"
                      value={taxiForm.pickupTime}
                      onChange={(e) => setTaxiForm({ ...taxiForm, pickupTime: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hotel or Drop-off Address</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">Vehicle Class</label>
                    <select
                      value={taxiForm.vehicleType}
                      onChange={(e) => setTaxiForm({ ...taxiForm, vehicleType: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="standard_sedan">Standard Sedan (Cobalt)</option>
                      <option value="comfort_plus">Comfort Plus (Lacetti)</option>
                      <option value="minivan_luggage">Minivan (Hyundai H1)</option>
                      <option value="business_vip">VIP Executive (Malibu/Merc)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Passengers</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">Luggage Bags</label>
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
                    <span className="text-[11px] text-slate-500 block">Total Guaranteed Tariff</span>
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
                  Confirm & Dispatch Airport Chauffeur
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
