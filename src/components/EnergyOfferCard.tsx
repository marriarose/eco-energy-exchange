import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign, Clock, MapPin } from 'lucide-react';
import { EnergyOffer, Home } from '@/lib/types';
import { TradeAcceptDialog } from './TradeAcceptDialog';

interface EnergyOfferCardProps {
  offer: EnergyOffer;
  userHomes: Home[];
  onTradeCreated: () => void;
}

export function EnergyOfferCard({ offer, userHomes, onTradeCreated }: EnergyOfferCardProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  
  const offerHome = offer.homes;
  const canAccept = userHomes.some(home => home.id !== offer.home_id);
  
  const expiresAt = new Date(offer.expires_at);
  const isExpired = expiresAt < new Date();
  const timeLeft = Math.max(0, expiresAt.getTime() - new Date().getTime());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{offerHome?.name}</h4>
                <Badge variant={isExpired ? "destructive" : "outline"}>
                  {isExpired ? "Expired" : offer.status}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1" />
                {offerHome?.location}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {isExpired ? (
                  "Expired"
                ) : (
                  `Expires in ${hoursLeft}h ${minutesLeft}m`
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">{offer.offered_kwh} kWh</p>
                <p className="text-xs text-muted-foreground">Energy available</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              <div>
                <p className="text-sm font-medium">${offer.price_per_kwh}/kWh</p>
                <p className="text-xs text-muted-foreground">Price per kWh</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Total: </span>
              <span className="text-green-600">${(offer.offered_kwh * offer.price_per_kwh).toFixed(2)}</span>
            </div>
            
            {!isExpired && offer.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => setShowAcceptDialog(true)}
                disabled={!canAccept}
                variant={canAccept ? "default" : "outline"}
              >
                {canAccept ? "Accept Offer" : "No Homes Available"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TradeAcceptDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        offer={offer}
        userHomes={userHomes}
        onTradeCreated={onTradeCreated}
      />
    </>
  );
} 