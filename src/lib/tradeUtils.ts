import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/lib/types';

export async function updateHomeEnergyAfterTrade(trade: Trade) {
  try {
    // Get current home data
    const { data: providerHome } = await supabase
      .from('homes')
      .select('current_generation_kwh, current_consumption_kwh')
      .eq('id', trade.provider_id)
      .single();

    const { data: receiverHome } = await supabase
      .from('homes')
      .select('current_generation_kwh, current_consumption_kwh')
      .eq('id', trade.receiver_id)
      .single();

    if (!providerHome || !receiverHome) {
      throw new Error('Home data not found');
    }

    // Update provider home (reduce generation to reflect energy transfer)
    const { error: providerError } = await supabase
      .from('homes')
      .update({
        current_generation_kwh: providerHome.current_generation_kwh - trade.energy_kwh
      })
      .eq('id', trade.provider_id);

    if (providerError) throw providerError;

    // Update receiver home (reduce consumption to reflect energy received)
    const { error: receiverError } = await supabase
      .from('homes')
      .update({
        current_consumption_kwh: receiverHome.current_consumption_kwh - trade.energy_kwh
      })
      .eq('id', trade.receiver_id);

    if (receiverError) throw receiverError;

    return { success: true };
  } catch (error) {
    console.error('Error updating home energy after trade:', error);
    return { success: false, error };
  }
}

export function calculateTradeTotal(energyKwh: number, pricePerKwh: number): number {
  return energyKwh * pricePerKwh;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
} 