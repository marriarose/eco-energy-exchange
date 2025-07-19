import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Home } from '@/lib/types';

interface EnergyChartProps {
  homes: Home[];
}

export function EnergyChart({ homes }: EnergyChartProps) {
  const chartData = homes.map(home => ({
    name: home.name,
    generation: home.current_generation_kwh,
    consumption: home.current_consumption_kwh,
    surplus: home.surplus_kwh
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Overview</CardTitle>
        <CardDescription>
          Current generation, consumption, and surplus for your homes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="generation" fill="hsl(var(--chart-1))" name="Generation" />
            <Bar dataKey="consumption" fill="hsl(var(--chart-2))" name="Consumption" />
            <Bar dataKey="surplus" fill="hsl(var(--chart-3))" name="Surplus" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}