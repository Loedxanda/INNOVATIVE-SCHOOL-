export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'school' | 'bus_stop' | 'student_home' | 'teacher_home' | 'other';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BusRoute {
  id: number;
  name: string;
  description?: string;
  start_location: Location;
  end_location: Location;
  waypoints: Location[];
  distance_km: number;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusStop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  route_id: number;
  order: number;
  estimated_arrival_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentLocation {
  student_id: number;
  student_name: string;
  home_address: string;
  home_latitude: number;
  home_longitude: number;
  nearest_bus_stop?: BusStop;
  bus_route?: BusRoute;
  distance_to_school_km: number;
  estimated_travel_time_minutes: number;
}

export interface SchoolLocation extends Location {
  radius_km: number;
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  facilities?: string[];
}

export interface MapSettings {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
  showLabels: boolean;
}

export interface RouteOptimization {
  route_id: number;
  optimized_waypoints: Location[];
  total_distance_km: number;
  total_duration_minutes: number;
  fuel_cost_estimate: number;
  co2_emissions_kg: number;
  efficiency_score: number;
  suggestions: string[];
}

export interface Geofence {
  id: number;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius_meters: number;
  type: 'school_zone' | 'bus_zone' | 'restricted_area' | 'safety_zone';
  is_active: boolean;
  alert_on_entry: boolean;
  alert_on_exit: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationHistory {
  id: number;
  student_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  source: 'gps' | 'network' | 'passive';
  is_verified: boolean;
  created_at: string;
}

export type MapMarker = google.maps.Marker;
export type MapPolyline = google.maps.Polyline;

export interface MapCircle {
  id: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
  isVisible: boolean;
  data?: any;
}

