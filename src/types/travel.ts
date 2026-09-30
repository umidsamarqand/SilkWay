export type ActivityCategory = 
  | 'cultural'
  | 'outdoor'
  | 'culinary'
  | 'scenic_rail'
  | 'eco_tourism'
  | 'coastal'
  | 'photography';

export type TransitMode = 
  | 'bullet_rail'
  | 'scenic_rail'
  | 'scenic_highway'
  | 'maritime_ferry'
  | 'regional_flight'
  | 'expedition_4x4';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: 'europe' | 'east_asia' | 'silk_road' | 'americas' | 'oceania' | 'middle_east';
  coordinates: {
    lat: number;
    lng: number;
  };
  shortDescription: string;
  highlight: string;
  primaryCategory: ActivityCategory;
  allCategories: ActivityCategory[];
  dailyBudgetMin: number; // in USD
  dailyBudgetMax: number;
  bestSeasons: Season[];
  logisticsMode: TransitMode;
  nearestHub: string;
  transitTimeFromHub: string;
  luggageForwardingSupported: boolean;
  carbonFootprintKgPerDay: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  imageUrl: string;
  logisticsNotes: string;
  attractions: string[];
}

export interface LogisticsCorridor {
  id: string;
  title: string;
  region: string;
  mode: TransitMode;
  waypoints: { name: string; lat: number; lng: number }[];
  totalDistanceKm: number;
  durationHours: number;
  frequency: string;
  luggageTransfer: boolean;
  scenicRating: number;
}

export interface FilterState {
  searchQuery: string;
  selectedRegion: string;
  departureDate: string;
  returnDate: string;
  budgetRange: [number, number];
  budgetTier: 'all' | 'budget' | 'comfort' | 'premium' | 'luxury';
  selectedCategories: ActivityCategory[];
  selectedTransitModes: TransitMode[];
  luggageForwardingOnly: boolean;
  maxTransitTimeHours: number;
}

export interface ItineraryStop {
  id: string;
  destination: Destination;
  days: number;
  customNotes?: string;
  transitOption?: TransitMode;
}

export type SidebarTab = 'hotels' | 'restaurants' | 'sightseeing' | 'hostels' | 'airport_taxi' | 'filters' | 'destinations' | 'itinerary';

export interface CityDistrictInfo {
  id: string;
  name: string;
  cityName: string;
  isDistrict: boolean;
  coordinates: { lat: number; lng: number };
  zoom: number;
  description: string;
}

export type UzbekPointType = 'hotel' | 'hostel' | 'place_to_watch' | 'airport_taxi' | 'restaurant';

export interface UzbekPoint {
  id: string;
  name: string;
  city: 'Tashkent' | 'Samarkand' | 'Bukhara' | 'Khiva' | 'Fergana' | 'Nukus' | 'Zaamin';
  district?: string;
  type: UzbekPointType;
  coordinates: {
    lat: number;
    lng: number;
  };
  priceUsd?: number; // per night, base taxi fare, or avg meal cost
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  stars?: number; // 3, 4, 5
  services?: string[]; // e.g. ['pool', 'rooftop', 'breakfast', 'wifi', 'airport_shuttle', 'ac', 'cards', 'parking', 'vegetarian']
  cuisine?: string[]; // for restaurants: ['plov', 'shashlik', 'samsa', 'lagman', 'tea', 'vegetarian']
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  description: string;
  highlights: string[];
  logisticsNote: string;
  address: string;
  phoneOrContact?: string;
  airportCode?: string; // For airport taxi hubs (TAS, SKD, BHK, UGC)
}

export interface TaxiBooking {
  id: string;
  airport: string;
  pickupLocation: string;
  dropoffLocation: string;
  flightNumber: string;
  passengerName: string;
  passengers: number;
  luggageCount: number;
  vehicleType: 'standard_sedan' | 'comfort_plus' | 'minivan_luggage' | 'business_vip';
  priceUsd: number;
  priceUzs: number;
  status: 'confirmed' | 'dispatched' | 'completed';
  driverName?: string;
  driverPhone?: string;
  pickupTime: string;
}

