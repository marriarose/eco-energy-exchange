import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingCart } from 'lucide-react';
import { Home } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnergyRequestFormProps {
  homes: Home[];
  onRequestCreated: () => void;
}

export function EnergyRequestForm({ homes, onRequestCreated }: EnergyRequestFormProps) {
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [requestedKwh, setRequestedKwh] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('0.15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('energy_requests')
        .insert({
          home_id: selectedHomeId,
          requested_kwh: parseFloat(requestedKwh),
          price_per_kwh: parseFloat(pricePerKwh)
        });

      if (error) throw error;

      toast({
        title: "Request created!",
        description: "Your energy request has been posted to the marketplace.",
      });

      // Reset form
      setSelectedHomeId('');
      setRequestedKwh('');
      setPricePerKwh('0.15');
      onRequestCreated();
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
          <ShoppingCart className="mr-2 h-5 w-5" />
          Request Energy
        </CardTitle>
        <CardDescription>
          Post a request for energy from the community
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
                {homes.map((home) => (
                  <SelectItem key={home.id} value={home.id}>
                    {home.name} ({home.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested">Energy Needed (kWh)</Label>
            <Input
              id="requested"
              type="number"
              step="0.01"
              min="0.01"
              value={requestedKwh}
              onChange={(e) => setRequestedKwh(e.target.value)}
              placeholder="e.g., 5.50"
              required
              disabled={loading}
            />
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

          <Button type="submit" className="w-full" disabled={loading || !selectedHomeId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}