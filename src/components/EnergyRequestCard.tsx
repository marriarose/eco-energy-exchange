import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign, Clock, MapPin } from 'lucide-react';
import { EnergyRequest, Home } from '@/lib/types';
import { TradeAcceptDialog } from './TradeAcceptDialog';

interface EnergyRequestCardProps {
  request: EnergyRequest;
  userHomes: Home[];
  onTradeCreated: () => void;
}

export function EnergyRequestCard({ request, userHomes, onTradeCreated }: EnergyRequestCardProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  
  const requestHome = request.homes;
  const canAccept = userHomes.some(home => 
    home.surplus_kwh >= request.requested_kwh && 
    home.id !== request.home_id
  );
  
  const expiresAt = new Date(request.expires_at);
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
                <h4 className="font-semibold">{requestHome?.name}</h4>
                <Badge variant={isExpired ? "destructive" : "outline"}>
                  {isExpired ? "Expired" : request.status}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1" />
                {requestHome?.location}
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
                <p className="text-sm font-medium">{request.requested_kwh} kWh</p>
                <p className="text-xs text-muted-foreground">Energy needed</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              <div>
                <p className="text-sm font-medium">${request.price_per_kwh}/kWh</p>
                <p className="text-xs text-muted-foreground">Price per kWh</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Total: </span>
              <span className="text-green-600">${(request.requested_kwh * request.price_per_kwh).toFixed(2)}</span>
            </div>
            
            {!isExpired && request.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => setShowAcceptDialog(true)}
                disabled={!canAccept}
                variant={canAccept ? "default" : "outline"}
              >
                {canAccept ? "Accept Request" : "Insufficient Surplus"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TradeAcceptDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        request={request}
        userHomes={userHomes}
        onTradeCreated={onTradeCreated}
      />
    </>
  );
} 