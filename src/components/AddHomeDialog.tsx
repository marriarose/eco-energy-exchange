import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AddHomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHomeAdded: () => void;
}

export function AddHomeDialog({ open, onOpenChange, onHomeAdded }: AddHomeDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [solarCapacity, setSolarCapacity] = useState('');
  const [currentGeneration, setCurrentGeneration] = useState('');
  const [currentConsumption, setCurrentConsumption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { coords } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('homes')
        .insert({
          user_id: user?.id,
          name,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          solar_capacity_kw: parseFloat(solarCapacity),
          current_generation_kwh: parseFloat(currentGeneration),
          current_consumption_kwh: parseFloat(currentConsumption)
        });

      if (error) throw error;

      toast({
        title: "Home added successfully!",
        description: `${name} has been added to your energy portfolio.`,
      });

      // Reset form
      setName('');
      setLocation('');
      setLatitude('');
      setLongitude('');
      setSolarCapacity('');
      setCurrentGeneration('');
      setCurrentConsumption('');
      
      onHomeAdded();
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Home</DialogTitle>
          <DialogDescription>
            Register a new home with solar panels to start energy sharing
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Home Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main House, Cabin"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 123 Green Valley Rd"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <div className="flex space-x-2">
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 40.7128"
                  disabled={loading}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (coords) {
                      setLatitude(coords.latitude.toString());
                      setLongitude(coords.longitude.toString());
                    }
                  }}
                  disabled={!coords || loading}
                  title="Use current location"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -74.0060"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Solar Capacity (kW)</Label>
            <Input
              id="capacity"
              type="number"
              step="0.1"
              min="0.1"
              value={solarCapacity}
              onChange={(e) => setSolarCapacity(e.target.value)}
              placeholder="e.g., 10.5"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation">Current Generation (kWh)</Label>
            <Input
              id="generation"
              type="number"
              step="0.01"
              min="0"
              value={currentGeneration}
              onChange={(e) => setCurrentGeneration(e.target.value)}
              placeholder="e.g., 8.25"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumption">Current Consumption (kWh)</Label>
            <Input
              id="consumption"
              type="number"
              step="0.01"
              min="0"
              value={currentConsumption}
              onChange={(e) => setCurrentConsumption(e.target.value)}
              placeholder="e.g., 5.75"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Home
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}