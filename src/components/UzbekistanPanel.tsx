import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Navigation,
  ArrowRight,
  ZoomIn,
  UtensilsCrossed,
  Search,
  X,
  ExternalLink
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
      {/* Top Search Bar (replaces the old hero banner) */}
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder', 'Search by hotel name, dish, street, or feature...')}
            className="w-full pl-11 pr-10 py-3.5 text-sm bg-[#0c1838]/90 border border-amber-500/30 ring-1 ring-amber-400/10 rounded-2xl text-white placeholder:text-slate-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 focus:shadow-amber-500/10 transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowTaxiModal(true)}
          title={t('hero.bookTaxi', 'Book Meet & Greet Airport Taxi (Name Sign)')}
          className="shrink-0 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
        >
          <Car className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Cuisine Filter (If restaurants or all active) */}
      {(activeSubtype === 'restaurant' || activeSubtype === 'all') && (
        <div className="p-3.5 bg-[#0c1838]/85 rounded-2xl border border-slate-800/80 shadow-lg text-white">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
            {t('cuisine.title', '🍲 Regional Cuisine Specialties:')}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CUISINE_KEYS.map((cKey) => {
              const isActive = selectedCuisine === cKey;
              const label = t(`cuisine.${cKey}`, cKey);
              return (
                <motion.button
                  key={cKey}
                  onClick={() => setSelectedCuisine(cKey)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'bg-orange-950/40 text-orange-200 border border-orange-800/60 hover:bg-orange-900/60 transition-colors'
                  }`}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
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
          <AnimatePresence initial={false} mode="popLayout">
          {filteredAndRankedPoints.map((point, pointIndex) => {
            const isSelected = selectedPoint?.id === point.id;

            return (
              <motion.div
                key={point.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                whileHover={{
                  y: -6,
                  scale: 1.016,
                  boxShadow: isSelected
                    ? '0 22px 45px -12px rgba(251,191,36,0.35)'
                    : '0 22px 45px -14px rgba(0,0,0,0.55)'
                }}
                whileTap={{ scale: 0.983 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(pointIndex, 10) * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                  boxShadow: { duration: 0.25 }
                }}
                onClick={() => {
                  onSelectPoint(point);
                  onFlyToPoint(point);
                }}
                className={`group overflow-hidden rounded-2xl border cursor-pointer text-left ${
                  isSelected
                    ? 'border-amber-400 bg-[#0f1f47] ring-2 ring-amber-400/40'
                    : 'border-slate-800/90 bg-[#0c1838]/85 hover:border-amber-400/60'
                }`}
              >
                {/* Full-width image header: top half clean photo, bottom half fades into the card */}
                <div className="relative w-full h-60 overflow-hidden bg-slate-900">
                  <img
                    src={point.imageUrl}
                    alt={point.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-105 transition-transform duration-700 ease-out group-hover:scale-115"
                  />
                  {/* Thin top scrim so the city/star badges stay legible on a bright photo */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />

                  {/* Bottom 50%: the photo dissolves fully into the card's own background color */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c1838] via-[#0c1838]/65 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                  <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs text-white text-[9px] font-bold rounded">
                    {point.city}
                  </div>

                  {point.stars && (
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-extrabold rounded flex items-center gap-0.5 shadow-xs">
                      <span>{point.stars}★</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 pt-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-base font-bold text-white line-clamp-1">
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
                      <span className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-[160px]" title={point.address}>
                        📍 {point.address}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                        {/* Direct Google Maps Exact Location Search Link */}
                        <a
                          href={point.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.name + ' ' + (point.city || 'Uzbekistan'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`View ${point.name} on Google Maps`}
                          className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-400/50 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 group/gmap"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover/gmap:text-amber-300 shrink-0" />
                          <span className="whitespace-nowrap">{t('results.googleMaps', 'Google Maps')}</span>
                        </a>

                        {/* In-app Map Fly To & Pinpoint Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPoint(point);
                            onFlyToPoint(point);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span className="whitespace-nowrap">{t('results.showOnMap', 'Show on Map')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        )}
      </div>

      {/* Airport Taxi Booking Modal */}
      <AnimatePresence>
      {showTaxiModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowTaxiModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 space-y-4"
          >
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
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
