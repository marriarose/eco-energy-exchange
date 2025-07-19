import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, DollarSign, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { EnergyRequest, EnergyOffer, Home as HomeType } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TradeAcceptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: EnergyRequest;
  offer?: EnergyOffer;
  userHomes: HomeType[];
  onTradeCreated: () => void;
}

export function TradeAcceptDialog({ 
  open, 
  onOpenChange, 
  request, 
  offer, 
  userHomes, 
  onTradeCreated 
}: TradeAcceptDialogProps) {
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const isAcceptingRequest = !!request;
  const isAcceptingOffer = !!offer;
  
  const item = request || offer;
  const itemHome = item?.homes;
  const energyAmount = request?.requested_kwh || offer?.offered_kwh || 0;
  const pricePerKwh = request?.price_per_kwh || offer?.price_per_kwh || 0;
  const totalAmount = energyAmount * pricePerKwh;

  // Filter homes that can participate in this trade
  const availableHomes = userHomes.filter(home => {
    if (isAcceptingRequest) {
      // When accepting a request, we need a home with surplus energy
      return home.surplus_kwh >= energyAmount;
    } else {
      // When accepting an offer, any home can receive energy
      return true;
    }
  });

  const handleAccept = async () => {
    if (!selectedHomeId || !item) return;
    
    setLoading(true);
    setError('');

    try {
      const selectedHome = userHomes.find(h => h.id === selectedHomeId);
      if (!selectedHome) throw new Error('Selected home not found');

      if (isAcceptingRequest) {
        // Accepting a request - we provide energy
        if (selectedHome.surplus_kwh < energyAmount) {
          throw new Error(`Insufficient surplus energy. Available: ${selectedHome.surplus_kwh.toFixed(2)} kWh`);
        }

        // Create trade record
        const { error: tradeError } = await supabase
          .from('trades')
          .insert({
            provider_id: selectedHomeId,
            receiver_id: request.home_id,
            request_id: request.id,
            energy_kwh: energyAmount,
            price_per_kwh: pricePerKwh
          });

        if (tradeError) throw tradeError;

        // Update request status
        const { error: requestError } = await supabase
          .from('energy_requests')
          .update({ status: 'matched' })
          .eq('id', request.id);

        if (requestError) throw requestError;

        toast({
          title: "Trade accepted!",
          description: `You're now providing ${energyAmount} kWh to ${itemHome?.name}`,
        });
      } else {
        // Accepting an offer - we receive energy
        // Create trade record
        const { error: tradeError } = await supabase
          .from('trades')
          .insert({
            provider_id: offer.home_id,
            receiver_id: selectedHomeId,
            offer_id: offer.id,
            energy_kwh: energyAmount,
            price_per_kwh: pricePerKwh
          });

        if (tradeError) throw tradeError;

        // Update offer status
        const { error: offerError } = await supabase
          .from('energy_offers')
          .update({ status: 'matched' })
          .eq('id', offer.id);

        if (offerError) throw offerError;

        toast({
          title: "Trade accepted!",
          description: `You're now receiving ${energyAmount} kWh from ${itemHome?.name}`,
        });
      }

      onTradeCreated();
      onOpenChange(false);
      setSelectedHomeId('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedHomeId('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Accept {isAcceptingRequest ? 'Request' : 'Offer'}
          </DialogTitle>
          <DialogDescription>
            Confirm the trade details and select your home
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">From:</span>
                  <span className="text-sm">{itemHome?.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Energy:</span>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="text-sm">{energyAmount} kWh</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price:</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-sm">${pricePerKwh}/kWh</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total:</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-sm font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Home Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select your home:</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableHomes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isAcceptingRequest 
                      ? "No homes with sufficient surplus energy available"
                      : "No homes available to receive energy"
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                availableHomes.map((home) => (
                  <div
                    key={home.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedHomeId === home.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedHomeId(home.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <span className="font-medium">{home.name}</span>
                      </div>
                      {isAcceptingRequest && (
                        <Badge variant="outline" className="text-xs">
                          Surplus: {home.surplus_kwh.toFixed(2)} kWh
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{home.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={loading || !selectedHomeId || availableHomes.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 