import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/types';
import { ArrowRightLeft, Calendar, DollarSign, Zap } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="mr-2 h-5 w-5" />
          Trade History
        </CardTitle>
        <CardDescription>
          Your energy trading activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <ArrowRightLeft className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
            <p className="text-muted-foreground">
              Start offering or requesting energy to see your trade history here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {trade.provider?.name} → {trade.receiver?.name}
                      </h4>
                      <Badge variant={trade.completed_at ? 'default' : 'secondary'}>
                        {trade.completed_at ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{trade.energy_kwh} kWh</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                        <span>${trade.price_per_kwh}/kWh</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                        <span>Total: ${trade.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{new Date(trade.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {trade.completed_at && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Completed: {new Date(trade.completed_at).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}