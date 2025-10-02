import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
} from '@mui/material';
import {
  Map as MapIcon,
  Directions as DirectionsIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  DirectionsBus as BusIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  MyLocation as MyLocationIcon,
  Route as RouteIcon,
  Traffic as TrafficIcon,
  Satellite as SatelliteIcon,
  Terrain as TerrainIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { 
  MapSettings, 
  Location, 
  BusRoute, 
  StudentLocation, 
  SchoolLocation, 
  MapMarker, 
  MapPolyline, 
  MapCircle 
} from '../types/maps';
import { mapsService } from '../services/mapsService';

// Google Maps will be loaded dynamically
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapViewerProps {
  height?: string;
  showControls?: boolean;
  showSettings?: boolean;
  onLocationSelect?: (location: Location) => void;
  onRouteSelect?: (route: BusRoute) => void;
}

const MapViewer: React.FC<MapViewerProps> = ({
  height = '500px',
  showControls = true,
  showSettings = false,
  onLocationSelect,
  onRouteSelect,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const polylinesRef = useRef<MapPolyline[]>([]);
  const circlesRef = useRef<MapCircle[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [settings, setSettings] = useState<MapSettings>({
    center: { lat: 3.848, lng: 11.502 }, // Yaoundé, Cameroon
    zoom: 12,
    mapType: 'roadmap',
    showTraffic: false,
    showTransit: false,
    showBicycling: false,
    showLabels: true,
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [studentLocations, setStudentLocations] = useState<StudentLocation[]>([]);
  const [schoolLocations, setSchoolLocations] = useState<SchoolLocation[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    loadMapData();
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [mapLoaded, settings]);

  const loadGoogleMaps = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);
  };

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError('');

      const [locationsData, routesData, studentsData, schoolsData] = await Promise.all([
        mapsService.getLocations(),
        mapsService.getBusRoutes(),
        mapsService.getStudentLocations(),
        mapsService.getSchoolLocations(),
      ]);

      setLocations(locationsData);
      setBusRoutes(routesData);
      setStudentLocations(studentsData);
      setSchoolLocations(schoolsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: settings.center,
      zoom: settings.zoom,
      mapTypeId: settings.mapType,
      trafficLayer: settings.showTraffic,
      transitLayer: settings.showTransit,
      bicyclingLayer: settings.showBicycling,
      styles: settings.showLabels ? [] : [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Add event listeners
    mapInstance.current.addListener('click', handleMapClick);
    mapInstance.current.addListener('zoom_changed', handleZoomChange);
    mapInstance.current.addListener('center_changed', handleCenterChange);

    // Load markers and routes
    loadMarkers();
    loadRoutes();
  };

  const loadMarkers = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add school markers
    schoolLocations.forEach(school => {
      const marker = new window.google.maps.Marker({
        position: { lat: school.latitude, lng: school.longitude },
        map: mapInstance.current,
        title: school.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#1976d2" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">S</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      marker.addListener('click', () => {
        setSelectedLocation(school);
        if (onLocationSelect) {
          onLocationSelect(school);
        }
      });

      markersRef.current.push(marker);
    });

    // Add bus stop markers
    locations
      .filter(loc => loc.type === 'bus_stop')
      .forEach(stop => {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.latitude, lng: stop.longitude },
          map: mapInstance.current,
          title: stop.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ff9800" stroke="#fff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">B</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
          },
        });

        marker.addListener('click', () => {
          setSelectedLocation(stop);
          if (onLocationSelect) {
            onLocationSelect(stop);
          }
        });

        markersRef.current.push(marker);
      });

    // Add student home markers
    studentLocations.forEach(student => {
      const marker = new window.google.maps.Marker({
        position: { lat: student.home_latitude, lng: student.home_longitude },
        map: mapInstance.current,
        title: student.student_name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#4caf50" stroke="#fff" stroke-width="2"/>
              <text x="10" y="14" text-anchor="middle" fill="white" font-size="10" font-weight="bold">H</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(20, 20),
        },
      });

      marker.addListener('click', () => {
        setSelectedLocation({
          id: student.student_id,
          name: student.student_name,
          address: student.home_address,
          latitude: student.home_latitude,
          longitude: student.home_longitude,
          type: 'student_home',
          created_at: '',
          updated_at: '',
        });
        if (onLocationSelect) {
          onLocationSelect({
            id: student.student_id,
            name: student.student_name,
            address: student.home_address,
            latitude: student.home_latitude,
            longitude: student.home_longitude,
            type: 'student_home',
            created_at: '',
            updated_at: '',
          });
        }
      });

      markersRef.current.push(marker);
    });
  };

  const loadRoutes = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];

    // Add bus route polylines
    busRoutes.forEach((route, index) => {
      const path = [
        { lat: route.start_location.latitude, lng: route.start_location.longitude },
        ...route.waypoints.map(waypoint => ({ lat: waypoint.latitude, lng: waypoint.longitude })),
        { lat: route.end_location.latitude, lng: route.end_location.longitude },
      ];

      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: `hsl(${index * 60}, 70%, 50%)`,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstance.current,
      });

      polyline.addListener('click', () => {
        setSelectedRoute(route);
        if (onRouteSelect) {
          onRouteSelect(route);
        }
      });

      polylinesRef.current.push(polyline);
    });
  };

  const handleMapClick = (event: any) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    console.log('Map clicked:', { lat, lng });
  };

  const handleZoomChange = () => {
    if (mapInstance.current) {
      setSettings(prev => ({
        ...prev,
        zoom: mapInstance.current.getZoom(),
      }));
    }
  };

  const handleCenterChange = () => {
    if (mapInstance.current) {
      const center = mapInstance.current.getCenter();
      setSettings(prev => ({
        ...prev,
        center: {
          lat: center.lat(),
          lng: center.lng(),
        },
      }));
    }
  };

  const handleRouteSelect = (routeId: string) => {
    const route = busRoutes.find(r => r.id.toString() === routeId);
    if (route) {
      setSelectedRoute(route);
      if (onRouteSelect) {
        onRouteSelect(route);
      }
    }
  };

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find(l => l.id.toString() === locationId);
    if (location) {
      setSelectedLocation(location);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    }
  };

  const handleSettingsChange = (newSettings: Partial<MapSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleRefresh = () => {
    loadMapData();
  };

  const handleFullscreen = () => {
    if (mapRef.current) {
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen();
      }
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSettings(prev => ({
            ...prev,
            center: { lat: latitude, lng: longitude },
            zoom: 15,
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls */}
      {showControls && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('maps.routes')}</InputLabel>
                  <Select
                    value={selectedRoute?.id || ''}
                    onChange={(e) => handleRouteSelect(String(e.target.value))}
                    label={t('maps.routes')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    {busRoutes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('maps.locations')}</InputLabel>
                  <Select
                    value={selectedLocation?.id || ''}
                    onChange={(e) => handleLocationSelect(String(e.target.value))}
                    label={t('maps.locations')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" gap={1}>
                  <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon />
                  </IconButton>
                  <IconButton onClick={handleMyLocation} size="small">
                    <MyLocationIcon />
                  </IconButton>
                  <IconButton onClick={handleFullscreen} size="small">
                    <FullscreenIcon />
                  </IconButton>
                  {showSettings && (
                    <IconButton onClick={() => setSettingsOpen(true)} size="small">
                      <SettingsIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<SchoolIcon />}
                    label={`${schoolLocations.length} Schools`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={<BusIcon />}
                    label={`${busRoutes.length} Routes`}
                    size="small"
                    color="secondary"
                  />
                  <Chip
                    icon={<HomeIcon />}
                    label={`${studentLocations.length} Students`}
                    size="small"
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Map Container */}
      <Card>
        <Box
          ref={mapRef}
          sx={{
            height,
            width: '100%',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        />
      </Card>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('maps.settings')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('maps.centerLat')}
                type="number"
                value={settings.center.lat}
                onChange={(e) => handleSettingsChange({
                  center: { ...settings.center, lat: parseFloat(e.target.value) }
                })}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('maps.centerLng')}
                type="number"
                value={settings.center.lng}
                onChange={(e) => handleSettingsChange({
                  center: { ...settings.center, lng: parseFloat(e.target.value) }
                })}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('maps.mapType')}</InputLabel>
                <Select
                  value={settings.mapType}
                  onChange={(e) => handleSettingsChange({ mapType: e.target.value as any })}
                  label={t('maps.mapType')}
                >
                  <MenuItem value="roadmap">{t('maps.roadmap')}</MenuItem>
                  <MenuItem value="satellite">{t('maps.satellite')}</MenuItem>
                  <MenuItem value="hybrid">{t('maps.hybrid')}</MenuItem>
                  <MenuItem value="terrain">{t('maps.terrain')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>{t('maps.zoom')}: {settings.zoom}</Typography>
              <Slider
                value={settings.zoom}
                onChange={(_, value) => handleSettingsChange({ zoom: value as number })}
                min={1}
                max={20}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTraffic}
                    onChange={(e) => handleSettingsChange({ showTraffic: e.target.checked })}
                  />
                }
                label={t('maps.showTraffic')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTransit}
                    onChange={(e) => handleSettingsChange({ showTransit: e.target.checked })}
                  />
                }
                label={t('maps.showTransit')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showBicycling}
                    onChange={(e) => handleSettingsChange({ showBicycling: e.target.checked })}
                  />
                }
                label={t('maps.showBicycling')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showLabels}
                    onChange={(e) => handleSettingsChange({ showLabels: e.target.checked })}
                  />
                }
                label={t('maps.showLabels')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapViewer;

