import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { MapPin, Zap, DollarSign, Users, Target, Navigation, Home as HomeIcon } from 'lucide-react';
import { Home, EnergyRequest, EnergyOffer } from '@/lib/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/lib/locationUtils';

interface TradingMapProps {
  homes: Home[];
  requests: EnergyRequest[];
  offers: EnergyOffer[];
  userHomes: Home[];
  onHomeSelect?: (home: Home) => void;
  onRequestSelect?: (request: EnergyRequest) => void;
  onOfferSelect?: (offer: EnergyOffer) => void;
}

interface MapMarker {
  id: string;
  position: [number, number];
  type: 'home' | 'request' | 'offer';
  data: Home | EnergyRequest | EnergyOffer;
  distance?: number;
}

export function TradingMap({ 
  homes, 
  requests, 
  offers, 
  userHomes, 
  onHomeSelect, 
  onRequestSelect, 
  onOfferSelect 
}: TradingMapProps) {
  const [selectedRadius, setSelectedRadius] = useState(10); // km
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showUserHomes, setShowUserHomes] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showOffers, setShowOffers] = useState(true);
  const [showOtherHomes, setShowOtherHomes] = useState(true);

  const { coords, error } = useGeolocation();

  // Get user location
  useEffect(() => {
    if (coords) {
      const userPos: [number, number] = [coords.latitude, coords.longitude];
      setUserLocation(userPos);
    } else if (error) {
      console.error('Error getting user location:', error);
      // Fallback to a default location
      setUserLocation([40.7128, -74.0060]); // New York
    }
  }, [coords, error]);



  // Process markers
  useEffect(() => {
    if (!userLocation) return;

    const allMarkers: MapMarker[] = [];

    // Add user homes
    if (showUserHomes) {
      userHomes.forEach(home => {
        if (home.latitude && home.longitude) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1], 
            home.latitude, home.longitude
          );
          
          allMarkers.push({
            id: `home-${home.id}`,
            position: [home.latitude, home.longitude],
            type: 'home',
            data: home,
            distance
          });
        }
      });
    }

    // Add other homes
    if (showOtherHomes) {
      homes.filter(home => !userHomes.find(uh => uh.id === home.id)).forEach(home => {
        if (home.latitude && home.longitude) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1], 
            home.latitude, home.longitude
          );
          
          allMarkers.push({
            id: `home-${home.id}`,
            position: [home.latitude, home.longitude],
            type: 'home',
            data: home,
            distance
          });
        }
      });
    }

    // Add requests
    if (showRequests) {
      requests.forEach(request => {
        const home = request.homes;
        if (home?.latitude && home?.longitude) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1], 
            home.latitude, home.longitude
          );
          
          allMarkers.push({
            id: `request-${request.id}`,
            position: [home.latitude, home.longitude],
            type: 'request',
            data: request,
            distance
          });
        }
      });
    }

    // Add offers
    if (showOffers) {
      offers.forEach(offer => {
        const home = offer.homes;
        if (home?.latitude && home?.longitude) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1], 
            home.latitude, home.longitude
          );
          
          allMarkers.push({
            id: `offer-${offer.id}`,
            position: [home.latitude, home.longitude],
            type: 'offer',
            data: offer,
            distance
          });
        }
      });
    }

    // Filter by radius
    const withinRadius = allMarkers.filter(marker => 
      marker.distance && marker.distance <= selectedRadius
    );
    setFilteredMarkers(withinRadius);
  }, [userLocation, homes, requests, offers, userHomes, selectedRadius, showUserHomes, showOtherHomes, showRequests, showOffers]);

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'home': return 'bg-green-500';
      case 'request': return 'bg-amber-500';
      case 'offer': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'home': return <HomeIcon className="h-4 w-4" />;
      case 'request': return <Zap className="h-4 w-4" />;
      case 'offer': return <DollarSign className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    
    // Trigger appropriate callback
    if (marker.type === 'home') {
      onHomeSelect?.(marker.data as Home);
    } else if (marker.type === 'request') {
      onRequestSelect?.(marker.data as EnergyRequest);
    } else if (marker.type === 'offer') {
      onOfferSelect?.(marker.data as EnergyOffer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Trading Map
        </CardTitle>
        <CardDescription>
          View energy trading opportunities within your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Search Radius: {selectedRadius} km</Label>
            <Slider
              value={[selectedRadius]}
              onValueChange={(value) => setSelectedRadius(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" disabled={!userLocation}>
              <Navigation className="h-4 w-4 mr-1" />
              {userLocation ? 'Location Found' : 'Getting Location...'}
            </Button>
          </div>
        </div>

        {/* Filter Toggles */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showUserHomes ? "default" : "outline"}
            onClick={() => setShowUserHomes(!showUserHomes)}
          >
            <Users className="h-4 w-4 mr-1" />
            My Homes
          </Button>
          <Button
            size="sm"
            variant={showOtherHomes ? "default" : "outline"}
            onClick={() => setShowOtherHomes(!showOtherHomes)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Other Homes
          </Button>
          <Button
            size="sm"
            variant={showRequests ? "default" : "outline"}
            onClick={() => setShowRequests(!showRequests)}
          >
            <Zap className="h-4 w-4 mr-1" />
            Requests
          </Button>
          <Button
            size="sm"
            variant={showOffers ? "default" : "outline"}
            onClick={() => setShowOffers(!showOffers)}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Offers
          </Button>
        </div>

        {/* Map Visualization */}
        <div className="border rounded-lg p-4 bg-gray-50 min-h-64">
          {userLocation ? (
            <div className="space-y-4">
              {/* User Location */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    You ({userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)})
                  </div>
                </div>
              </div>

              {/* Radius Circle */}
              <div className="flex items-center justify-center">
                <div 
                  className="border-2 border-blue-300 border-dashed rounded-full bg-blue-50"
                  style={{ 
                    width: `${Math.min(selectedRadius * 10, 200)}px`, 
                    height: `${Math.min(selectedRadius * 10, 200)}px` 
                  }}
                ></div>
              </div>

              {/* Markers */}
              <div className="relative">
                {filteredMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${50 + (marker.position[1] - userLocation[1]) * 1000}%`,
                      top: `${50 + (marker.position[0] - userLocation[0]) * 1000}%`,
                    }}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className={`w-6 h-6 ${getMarkerColor(marker.type)} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white`}>
                      {getMarkerIcon(marker.type)}
                    </div>
                                         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                       {marker.distance ? formatDistance(marker.distance) : ''}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Getting your location...</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Homes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
            <span>Energy Requests</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Energy Offers</span>
          </div>
        </div>

        {/* Selected Marker Info */}
        {selectedMarker && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {selectedMarker.type === 'home' && (selectedMarker.data as Home).name}
                    {selectedMarker.type === 'request' && `Request from ${(selectedMarker.data as EnergyRequest).homes?.name}`}
                    {selectedMarker.type === 'offer' && `Offer from ${(selectedMarker.data as EnergyOffer).homes?.name}`}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedMarker.type === 'home' && (selectedMarker.data as Home).location}
                    {selectedMarker.type === 'request' && (selectedMarker.data as EnergyRequest).homes?.location}
                    {selectedMarker.type === 'offer' && (selectedMarker.data as EnergyOffer).homes?.location}
                  </p>
                  <div className="flex items-center mt-2">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                                         <span className="text-sm font-medium">
                       {selectedMarker.distance ? formatDistance(selectedMarker.distance) : ''} away
                     </span>
                  </div>
                  
                  {selectedMarker.type === 'request' && (
                    <div className="mt-2">
                      <Badge variant="outline" className="mr-2">
                        <Zap className="h-3 w-3 mr-1" />
                        {(selectedMarker.data as EnergyRequest).requested_kwh} kWh
                      </Badge>
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${(selectedMarker.data as EnergyRequest).price_per_kwh}/kWh
                      </Badge>
                    </div>
                  )}
                  
                  {selectedMarker.type === 'offer' && (
                    <div className="mt-2">
                      <Badge variant="outline" className="mr-2">
                        <Zap className="h-3 w-3 mr-1" />
                        {(selectedMarker.data as EnergyOffer).offered_kwh} kWh
                      </Badge>
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${(selectedMarker.data as EnergyOffer).price_per_kwh}/kWh
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Locations List */}
        <div className="space-y-2">
          <h4 className="font-medium">Nearby Locations ({filteredMarkers.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredMarkers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No locations found within {selectedRadius}km radius
              </p>
            ) : (
              filteredMarkers
                .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                .map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${getMarkerColor(marker.type)} rounded-full flex items-center justify-center text-white`}>
                        {getMarkerIcon(marker.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {marker.type === 'home' && (marker.data as Home).name}
                          {marker.type === 'request' && `Request from ${(marker.data as EnergyRequest).homes?.name}`}
                          {marker.type === 'offer' && `Offer from ${(marker.data as EnergyOffer).homes?.name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {marker.type === 'home' && (marker.data as Home).location}
                          {marker.type === 'request' && (marker.data as EnergyRequest).homes?.location}
                          {marker.type === 'offer' && (marker.data as EnergyOffer).homes?.location}
                        </p>
                      </div>
                    </div>
                                         <div className="text-right">
                       <p className="text-sm font-medium">{marker.distance ? formatDistance(marker.distance) : ''}</p>
                       <Badge variant="outline" className="text-xs">
                         {marker.type}
                       </Badge>
                     </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {filteredMarkers.filter(m => m.type === 'home').length}
            </div>
            <div className="text-xs text-muted-foreground">Homes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-amber-600">
              {filteredMarkers.filter(m => m.type === 'request').length}
            </div>
            <div className="text-xs text-muted-foreground">Requests</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {filteredMarkers.filter(m => m.type === 'offer').length}
            </div>
            <div className="text-xs text-muted-foreground">Offers</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">
              {filteredMarkers.length}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 