import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, DollarSign, Calendar, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Trade, Home } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateHomeEnergyAfterTrade } from '@/lib/tradeUtils';

interface ActiveTradesProps {
  trades: Trade[];
  userHomes: Home[];
  onTradeUpdated: () => void;
}

export function ActiveTrades({ trades, userHomes, onTradeUpdated }: ActiveTradesProps) {
  const [completingTradeId, setCompletingTradeId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const activeTrades = trades.filter(trade => !trade.completed_at);

  const canCompleteTrade = (trade: Trade) => {
    // User can complete trade if they own either the provider or receiver home
    const userHomeIds = userHomes.map(home => home.id);
    return userHomeIds.includes(trade.provider_id) || userHomeIds.includes(trade.receiver_id);
  };

  const getUserRole = (trade: Trade) => {
    const userHomeIds = userHomes.map(home => home.id);
    if (userHomeIds.includes(trade.provider_id)) {
      return 'provider';
    } else if (userHomeIds.includes(trade.receiver_id)) {
      return 'receiver';
    }
    return null;
  };

  const handleCompleteTrade = async (tradeId: string) => {
    setCompletingTradeId(tradeId);
    
    try {
      // Get the trade details
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (tradeError || !trade) throw tradeError || new Error('Trade not found');

      // Mark trade as completed
      const { error } = await supabase
        .from('trades')
        .update({ 
          completed_at: new Date().toISOString() 
        })
        .eq('id', tradeId);

      if (error) throw error;

      // Update home energy data
      const updateResult = await updateHomeEnergyAfterTrade(trade);
      if (!updateResult.success) {
        console.warn('Failed to update home energy data:', updateResult.error);
      }

      toast({
        title: "Trade completed!",
        description: "The energy transfer has been marked as complete.",
      });

      onTradeUpdated();
    } catch (error: any) {
      toast({
        title: "Error completing trade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCompletingTradeId(null);
    }
  };

  if (activeTrades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            Active Trades
          </CardTitle>
          <CardDescription>
            Your ongoing energy transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowRightLeft className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active trades</h3>
            <p className="text-muted-foreground">
              Start accepting energy requests or offers to see active trades here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="mr-2 h-5 w-5" />
          Active Trades
        </CardTitle>
        <CardDescription>
          Your ongoing energy transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeTrades.map((trade) => {
            const userRole = getUserRole(trade);
            const canComplete = canCompleteTrade(trade);
            const isCompleting = completingTradeId === trade.id;

            return (
              <div key={trade.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {trade.provider?.name} → {trade.receiver?.name}
                      </h4>
                      <Badge variant="secondary">
                        {userRole === 'provider' ? 'You are providing' : 
                         userRole === 'receiver' ? 'You are receiving' : 'Third party'}
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
                
                {canComplete && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {userRole === 'provider' 
                        ? 'Mark as transferred when energy has been sent'
                        : 'Mark as received when energy has been received'
                      }
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTrade(trade.id)}
                      disabled={isCompleting}
                    >
                      {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {userRole === 'provider' ? 'Mark Sent' : 'Mark Received'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 