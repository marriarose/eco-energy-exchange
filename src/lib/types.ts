export interface Home {
  id: string;
  user_id: string;
  name: string;
  location: string;
  solar_capacity_kw: number;
  current_generation_kwh: number;
  current_consumption_kwh: number;
  surplus_kwh: number;
  last_updated: string;
  created_at: string;
}

export interface EnergyRequest {
  id: string;
  home_id: string;
  requested_kwh: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  price_per_kwh: number;
  timestamp: string;
  expires_at: string;
  homes?: Home;
}

export interface EnergyOffer {
  id: string;
  home_id: string;
  offered_kwh: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  price_per_kwh: number;
  timestamp: string;
  expires_at: string;
  homes?: Home;
}

export interface Trade {
  id: string;
  provider_id: string;
  receiver_id: string;
  offer_id?: string;
  request_id?: string;
  energy_kwh: number;
  price_per_kwh: number;
  total_amount: number;
  timestamp: string;
  completed_at?: string;
  provider?: Home;
  receiver?: Home;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}