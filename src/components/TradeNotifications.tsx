import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign, Bell, X } from 'lucide-react';
import { EnergyRequest, EnergyOffer, Home } from '@/lib/types';

interface TradeNotificationsProps {
  requests: EnergyRequest[];
  offers: EnergyOffer[];
  userHomes: Home[];
  onDismiss: () => void;
}

export function TradeNotifications({ requests, offers, userHomes, onDismiss }: TradeNotificationsProps) {
  const [showNotifications, setShowNotifications] = useState(true);

  const canAcceptRequest = (request: EnergyRequest) => {
    return userHomes.some(home => 
      home.surplus_kwh >= request.requested_kwh && 
      home.id !== request.home_id
    );
  };

  const canAcceptOffer = (offer: EnergyOffer) => {
    return userHomes.some(home => home.id !== offer.home_id);
  };

  const acceptableRequests = requests.filter(canAcceptRequest);
  const acceptableOffers = offers.filter(canAcceptOffer);

  const totalOpportunities = acceptableRequests.length + acceptableOffers.length;

  if (!showNotifications || totalOpportunities === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-green-800">
            <Bell className="mr-2 h-5 w-5" />
            Trading Opportunities
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(false)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-green-700">
          You have {totalOpportunities} new opportunity{totalOpportunities !== 1 ? 's' : ''} to trade energy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {acceptableRequests.length > 0 && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">
              Energy Requests ({acceptableRequests.length})
            </h4>
            <div className="space-y-2">
              {acceptableRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">{request.homes?.name}</p>
                      <p className="text-xs text-green-600">
                        Needs {request.requested_kwh} kWh at ${request.price_per_kwh}/kWh
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    ${(request.requested_kwh * request.price_per_kwh).toFixed(2)}
                  </Badge>
                </div>
              ))}
              {acceptableRequests.length > 2 && (
                <p className="text-xs text-green-600 text-center">
                  +{acceptableRequests.length - 2} more requests
                </p>
              )}
            </div>
          </div>
        )}

        {acceptableOffers.length > 0 && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">
              Energy Offers ({acceptableOffers.length})
            </h4>
            <div className="space-y-2">
              {acceptableOffers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{offer.homes?.name}</p>
                      <p className="text-xs text-green-600">
                        Offering {offer.offered_kwh} kWh at ${offer.price_per_kwh}/kWh
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    ${(offer.offered_kwh * offer.price_per_kwh).toFixed(2)}
                  </Badge>
                </div>
              ))}
              {acceptableOffers.length > 2 && (
                <p className="text-xs text-green-600 text-center">
                  +{acceptableOffers.length - 2} more offers
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              setShowNotifications(false);
              onDismiss();
            }}
          >
            View All Opportunities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 