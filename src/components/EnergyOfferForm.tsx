import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap } from 'lucide-react';
import { Home } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnergyOfferFormProps {
  homes: Home[];
  onOfferCreated: () => void;
}

export function EnergyOfferForm({ homes, onOfferCreated }: EnergyOfferFormProps) {
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [offeredKwh, setOfferedKwh] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('0.15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const selectedHome = homes.find(h => h.id === selectedHomeId);
  const maxOffer = selectedHome?.surplus_kwh || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const offered = parseFloat(offeredKwh);
    
    if (offered > maxOffer) {
      setError(`Cannot offer more than available surplus (${maxOffer.toFixed(2)} kWh)`);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('energy_offers')
        .insert({
          home_id: selectedHomeId,
          offered_kwh: offered,
          price_per_kwh: parseFloat(pricePerKwh)
        });

      if (error) throw error;

      toast({
        title: "Offer created!",
        description: "Your energy offer has been posted to the marketplace.",
      });

      // Reset form
      setSelectedHomeId('');
      setOfferedKwh('');
      setPricePerKwh('0.15');
      onOfferCreated();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Offer Energy
        </CardTitle>
        <CardDescription>
          Share your surplus energy with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="home">Select Home</Label>
            <Select value={selectedHomeId} onValueChange={setSelectedHomeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a home" />
              </SelectTrigger>
              <SelectContent>
                {homes.filter(h => h.surplus_kwh > 0).map((home) => (
                  <SelectItem key={home.id} value={home.id}>
                    {home.name} (Surplus: {home.surplus_kwh.toFixed(2)} kWh)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {homes.filter(h => h.surplus_kwh > 0).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No homes with surplus energy available
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="offered">Energy to Offer (kWh)</Label>
            <Input
              id="offered"
              type="number"
              step="0.01"
              min="0.01"
              max={maxOffer}
              value={offeredKwh}
              onChange={(e) => setOfferedKwh(e.target.value)}
              placeholder={`Max: ${maxOffer.toFixed(2)} kWh`}
              required
              disabled={loading || !selectedHomeId}
            />
            {selectedHomeId && (
              <p className="text-sm text-muted-foreground">
                Available surplus: {maxOffer.toFixed(2)} kWh
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per kWh ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={pricePerKwh}
              onChange={(e) => setPricePerKwh(e.target.value)}
              placeholder="e.g., 0.15"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !selectedHomeId || maxOffer <= 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Offer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}