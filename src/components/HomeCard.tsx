import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home as HomeType } from '@/lib/types';
import { MapPin, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface HomeCardProps {
  home: HomeType;
}

export function HomeCard({ home }: HomeCardProps) {
  const getSurplusColor = (surplus: number) => {
    if (surplus > 0) return 'text-green-600';
    if (surplus < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getSurplusIcon = (surplus: number) => {
    if (surplus > 0) return <TrendingUp className="h-4 w-4" />;
    if (surplus < 0) return <TrendingDown className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{home.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {home.location}
            </div>
          </div>
          <Badge variant={home.surplus_kwh > 0 ? 'default' : 'secondary'}>
            {home.surplus_kwh > 0 ? 'Surplus' : home.surplus_kwh < 0 ? 'Deficit' : 'Balanced'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Generation</p>
            <p className="font-semibold text-green-600">
              {home.current_generation_kwh.toFixed(2)} kWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Consumption</p>
            <p className="font-semibold text-blue-600">
              {home.current_consumption_kwh.toFixed(2)} kWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Surplus</p>
            <div className={`font-semibold flex items-center justify-center ${getSurplusColor(home.surplus_kwh)}`}>
              {getSurplusIcon(home.surplus_kwh)}
              <span className="ml-1">{home.surplus_kwh.toFixed(2)} kWh</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Last updated: {new Date(home.last_updated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}