-- Create enum for request/offer status
CREATE TYPE public.energy_status AS ENUM ('pending', 'matched', 'completed', 'cancelled');

-- Create homes table
CREATE TABLE public.homes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  solar_capacity_kw DECIMAL(8,2) NOT NULL DEFAULT 0,
  current_generation_kwh DECIMAL(8,2) NOT NULL DEFAULT 0,
  current_consumption_kwh DECIMAL(8,2) NOT NULL DEFAULT 0,
  surplus_kwh DECIMAL(8,2) GENERATED ALWAYS AS (current_generation_kwh - current_consumption_kwh) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create energy_requests table
CREATE TABLE public.energy_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  requested_kwh DECIMAL(8,2) NOT NULL,
  status energy_status NOT NULL DEFAULT 'pending',
  price_per_kwh DECIMAL(8,2) DEFAULT 0.15,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '1 hour'
);

-- Create energy_offers table
CREATE TABLE public.energy_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  offered_kwh DECIMAL(8,2) NOT NULL,
  status energy_status NOT NULL DEFAULT 'pending',
  price_per_kwh DECIMAL(8,2) DEFAULT 0.15,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '1 hour'
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.energy_offers(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.energy_requests(id) ON DELETE SET NULL,
  energy_kwh DECIMAL(8,2) NOT NULL,
  price_per_kwh DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (energy_kwh * price_per_kwh) STORED,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for homes
CREATE POLICY "Users can view all homes" ON public.homes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own homes" ON public.homes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own homes" ON public.homes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own homes" ON public.homes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for energy_requests
CREATE POLICY "Users can view all energy requests" ON public.energy_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert requests for their homes" ON public.energy_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own requests" ON public.energy_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own requests" ON public.energy_requests FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);

-- Create RLS policies for energy_offers
CREATE POLICY "Users can view all energy offers" ON public.energy_offers FOR SELECT USING (true);
CREATE POLICY "Users can insert offers for their homes" ON public.energy_offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own offers" ON public.energy_offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own offers" ON public.energy_offers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = home_id AND user_id = auth.uid())
);

-- Create RLS policies for trades
CREATE POLICY "Users can view trades involving their homes" ON public.trades FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = provider_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.homes WHERE id = receiver_id AND user_id = auth.uid())
);
CREATE POLICY "System can insert trades" ON public.trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update trades involving their homes" ON public.trades FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.homes WHERE id = provider_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.homes WHERE id = receiver_id AND user_id = auth.uid())
);

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homes_last_updated
  BEFORE UPDATE ON public.homes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.homes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Set replica identity for realtime
ALTER TABLE public.homes REPLICA IDENTITY FULL;
ALTER TABLE public.energy_requests REPLICA IDENTITY FULL;
ALTER TABLE public.energy_offers REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX idx_homes_user_id ON public.homes(user_id);
CREATE INDEX idx_energy_requests_home_id ON public.energy_requests(home_id);
CREATE INDEX idx_energy_requests_status ON public.energy_requests(status);
CREATE INDEX idx_energy_offers_home_id ON public.energy_offers(home_id);
CREATE INDEX idx_energy_offers_status ON public.energy_offers(status);
CREATE INDEX idx_trades_provider_id ON public.trades(provider_id);
CREATE INDEX idx_trades_receiver_id ON public.trades(receiver_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);