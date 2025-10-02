import axios from 'axios';
import { 
  Location, 
  BusRoute, 
  BusStop, 
  StudentLocation, 
  SchoolLocation, 
  MapSettings, 
  RouteOptimization, 
  Geofence, 
  LocationHistory 
} from '../types/maps';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const mapsService = {
  // Location Management
  async getLocations(): Promise<Location[]> {
    const response = await api.get('/maps/locations');
    return response.data;
  },

  async getLocation(locationId: number): Promise<Location> {
    const response = await api.get(`/maps/locations/${locationId}`);
    return response.data;
  },

  async createLocation(locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    const response = await api.post('/maps/locations', locationData);
    return response.data;
  },

  async updateLocation(locationId: number, locationData: Partial<Location>): Promise<Location> {
    const response = await api.patch(`/maps/locations/${locationId}`, locationData);
    return response.data;
  },

  async deleteLocation(locationId: number): Promise<void> {
    await api.delete(`/maps/locations/${locationId}`);
  },

  // Bus Route Management
  async getBusRoutes(): Promise<BusRoute[]> {
    const response = await api.get('/maps/bus-routes');
    return response.data;
  },

  async getBusRoute(routeId: number): Promise<BusRoute> {
    const response = await api.get(`/maps/bus-routes/${routeId}`);
    return response.data;
  },

  async createBusRoute(routeData: Omit<BusRoute, 'id' | 'created_at' | 'updated_at'>): Promise<BusRoute> {
    const response = await api.post('/maps/bus-routes', routeData);
    return response.data;
  },

  async updateBusRoute(routeId: number, routeData: Partial<BusRoute>): Promise<BusRoute> {
    const response = await api.patch(`/maps/bus-routes/${routeId}`, routeData);
    return response.data;
  },

  async deleteBusRoute(routeId: number): Promise<void> {
    await api.delete(`/maps/bus-routes/${routeId}`);
  },

  // Bus Stop Management
  async getBusStops(): Promise<BusStop[]> {
    const response = await api.get('/maps/bus-stops');
    return response.data;
  },

  async getBusStopsByRoute(routeId: number): Promise<BusStop[]> {
    const response = await api.get(`/maps/bus-routes/${routeId}/stops`);
    return response.data;
  },

  async createBusStop(stopData: Omit<BusStop, 'id' | 'created_at' | 'updated_at'>): Promise<BusStop> {
    const response = await api.post('/maps/bus-stops', stopData);
    return response.data;
  },

  async updateBusStop(stopId: number, stopData: Partial<BusStop>): Promise<BusStop> {
    const response = await api.patch(`/maps/bus-stops/${stopId}`, stopData);
    return response.data;
  },

  async deleteBusStop(stopId: number): Promise<void> {
    await api.delete(`/maps/bus-stops/${stopId}`);
  },

  // Student Location Management
  async getStudentLocations(): Promise<StudentLocation[]> {
    const response = await api.get('/maps/student-locations');
    return response.data;
  },

  async getStudentLocation(studentId: number): Promise<StudentLocation> {
    const response = await api.get(`/maps/student-locations/${studentId}`);
    return response.data;
  },

  async updateStudentLocation(studentId: number, locationData: Partial<StudentLocation>): Promise<StudentLocation> {
    const response = await api.patch(`/maps/student-locations/${studentId}`, locationData);
    return response.data;
  },

  // School Location Management
  async getSchoolLocations(): Promise<SchoolLocation[]> {
    const response = await api.get('/maps/school-locations');
    return response.data;
  },

  async getSchoolLocation(schoolId: number): Promise<SchoolLocation> {
    const response = await api.get(`/maps/school-locations/${schoolId}`);
    return response.data;
  },

  async updateSchoolLocation(schoolId: number, locationData: Partial<SchoolLocation>): Promise<SchoolLocation> {
    const response = await api.patch(`/maps/school-locations/${schoolId}`, locationData);
    return response.data;
  },

  // Route Optimization
  async optimizeRoute(routeId: number): Promise<RouteOptimization> {
    const response = await api.post(`/maps/bus-routes/${routeId}/optimize`);
    return response.data;
  },

  async getRouteSuggestions(routeId: number): Promise<string[]> {
    const response = await api.get(`/maps/bus-routes/${routeId}/suggestions`);
    return response.data;
  },

  // Geofencing
  async getGeofences(): Promise<Geofence[]> {
    const response = await api.get('/maps/geofences');
    return response.data;
  },

  async createGeofence(geofenceData: Omit<Geofence, 'id' | 'created_at' | 'updated_at'>): Promise<Geofence> {
    const response = await api.post('/maps/geofences', geofenceData);
    return response.data;
  },

  async updateGeofence(geofenceId: number, geofenceData: Partial<Geofence>): Promise<Geofence> {
    const response = await api.patch(`/maps/geofences/${geofenceId}`, geofenceData);
    return response.data;
  },

  async deleteGeofence(geofenceId: number): Promise<void> {
    await api.delete(`/maps/geofences/${geofenceId}`);
  },

  // Location History
  async getLocationHistory(studentId: number, startDate?: string, endDate?: string): Promise<LocationHistory[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/maps/student-locations/${studentId}/history?${params.toString()}`);
    return response.data;
  },

  async addLocationHistory(studentId: number, locationData: Omit<LocationHistory, 'id' | 'created_at'>): Promise<LocationHistory> {
    const response = await api.post(`/maps/student-locations/${studentId}/history`, locationData);
    return response.data;
  },

  // Map Utilities
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    const response = await api.post('/maps/geocode', { address });
    return response.data;
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const response = await api.post('/maps/reverse-geocode', { lat, lng });
    return response.data;
  },

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance_km: number; duration_minutes: number }> {
    const response = await api.post('/maps/calculate-distance', { origin, destination });
    return response.data;
  },

  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>
  ): Promise<any> {
    const response = await api.post('/maps/directions', { origin, destination, waypoints });
    return response.data;
  },

  // Map Settings
  async getMapSettings(): Promise<MapSettings> {
    const response = await api.get('/maps/settings');
    return response.data;
  },

  async updateMapSettings(settings: Partial<MapSettings>): Promise<MapSettings> {
    const response = await api.patch('/maps/settings', settings);
    return response.data;
  },

  // Real-time Tracking
  async startTracking(studentId: number): Promise<void> {
    await api.post(`/maps/tracking/start/${studentId}`);
  },

  async stopTracking(studentId: number): Promise<void> {
    await api.post(`/maps/tracking/stop/${studentId}`);
  },

  async getTrackingStatus(studentId: number): Promise<{ is_tracking: boolean; last_update?: string }> {
    const response = await api.get(`/maps/tracking/status/${studentId}`);
    return response.data;
  },

  // Analytics
  async getRouteAnalytics(routeId: number, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/maps/bus-routes/${routeId}/analytics?${params.toString()}`);
    return response.data;
  },

  async getStudentTravelAnalytics(studentId: number, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/maps/student-locations/${studentId}/analytics?${params.toString()}`);
    return response.data;
  },
};

