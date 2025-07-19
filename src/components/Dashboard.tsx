import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Plus, Zap, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Home as HomeType, EnergyRequest, EnergyOffer, Trade } from '@/lib/types';
import { EnergyChart } from '@/components/EnergyChart';
import { HomeCard } from '@/components/HomeCard';
import { EnergyRequestForm } from '@/components/EnergyRequestForm';
import { EnergyOfferForm } from '@/components/EnergyOfferForm';
import { TradeHistory } from '@/components/TradeHistory';
import { AddHomeDialog } from '@/components/AddHomeDialog';

export function Dashboard() {
  const { user } = useAuth();
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [userHomes, setUserHomes] = useState<HomeType[]>([]);
  const [requests, setRequests] = useState<EnergyRequest[]>([]);
  const [offers, setOffers] = useState<EnergyOffer[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddHome, setShowAddHome] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all homes
      const { data: allHomes } = await supabase
        .from('homes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch user's homes
      const { data: myHomes } = await supabase
        .from('homes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch energy requests
      const { data: requestsData } = await supabase
        .from('energy_requests')
        .select(`
          *,
          homes (*)
        `)
        .eq('status', 'pending')
        .order('timestamp', { ascending: false });

      // Fetch energy offers
      const { data: offersData } = await supabase
        .from('energy_offers')
        .select(`
          *,
          homes (*)
        `)
        .eq('status', 'pending')
        .order('timestamp', { ascending: false });

      // Fetch trades involving user's homes
      const { data: tradesData } = await supabase
        .from('trades')
        .select(`
          *,
          provider:homes!trades_provider_id_fkey (*),
          receiver:homes!trades_receiver_id_fkey (*)
        `)
        .or(`provider_id.in.(${myHomes?.map(h => h.id).join(',')}),receiver_id.in.(${myHomes?.map(h => h.id).join(',')})`)
        .order('timestamp', { ascending: false });

      setHomes(allHomes || []);
      setUserHomes(myHomes || []);
      setRequests(requestsData || []);
      setOffers(offersData || []);
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homes' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'energy_requests' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'energy_offers' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const totalGeneration = userHomes.reduce((sum, home) => sum + home.current_generation_kwh, 0);
  const totalConsumption = userHomes.reduce((sum, home) => sum + home.current_consumption_kwh, 0);
  const totalSurplus = userHomes.reduce((sum, home) => sum + home.surplus_kwh, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userHomes.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Welcome to GridXchange</h1>
            <p className="text-muted-foreground mb-6">
              Add your first home to start sharing solar energy with your community
            </p>
            <Button onClick={() => setShowAddHome(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your Home
            </Button>
          </div>
        </div>
        
        <AddHomeDialog 
          open={showAddHome}
          onOpenChange={setShowAddHome}
          onHomeAdded={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Energy Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your solar energy sharing
            </p>
          </div>
          <Button onClick={() => setShowAddHome(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Home
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Generation</p>
                  <p className="text-2xl font-bold">{totalGeneration.toFixed(2)} kWh</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumption</p>
                  <p className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Surplus</p>
                  <p className="text-2xl font-bold">{totalSurplus.toFixed(2)} kWh</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Trades</p>
                  <p className="text-2xl font-bold">{trades.filter(t => !t.completed_at).length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyChart homes={userHomes} />
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="mr-2 h-5 w-5" />
                      Your Homes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userHomes.map((home) => (
                      <HomeCard key={home.id} home={home} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <EnergyRequestForm homes={userHomes} onRequestCreated={fetchData} />
                <EnergyOfferForm homes={userHomes} onOfferCreated={fetchData} />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Requests</CardTitle>
                    <CardDescription>Energy requests from the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {requests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No active requests</p>
                    ) : (
                      requests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{request.homes?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Needs {request.requested_kwh} kWh at ${request.price_per_kwh}/kWh
                            </p>
                          </div>
                          <Badge variant="outline">
                            {request.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Active Offers</CardTitle>
                    <CardDescription>Energy offers from the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {offers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No active offers</p>
                    ) : (
                      offers.slice(0, 3).map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{offer.homes?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Offering {offer.offered_kwh} kWh at ${offer.price_per_kwh}/kWh
                            </p>
                          </div>
                          <Badge variant="outline">
                            {offer.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades">
            <TradeHistory trades={trades} />
          </TabsContent>
        </Tabs>
      </div>

      <AddHomeDialog 
        open={showAddHome}
        onOpenChange={setShowAddHome}
        onHomeAdded={fetchData}
      />
    </div>
  );
}