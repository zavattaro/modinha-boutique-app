-- Create affiliates table for "Ubers"
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% commission
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  discount_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% discount
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT NULL, -- NULL means unlimited
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon transactions table to track usage
CREATE TABLE public.coupon_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_reference TEXT,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  customer_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliates (public read for now, admin write)
CREATE POLICY "Anyone can view active affiliates" 
ON public.affiliates 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage affiliates" 
ON public.affiliates 
FOR ALL 
USING (true);

-- Create policies for coupons (public read for validation)
CREATE POLICY "Anyone can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (true);

-- Create policies for coupon transactions (admin only)
CREATE POLICY "Admins can view all coupon transactions" 
ON public.coupon_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create coupon transactions" 
ON public.coupon_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample affiliate and coupon for testing
INSERT INTO public.affiliates (name, email, phone) VALUES 
('João Uber', 'joao.uber@email.com', '(11) 99999-8888');

INSERT INTO public.coupons (code, affiliate_id, discount_rate, status) VALUES 
('UBER10', (SELECT id FROM public.affiliates WHERE email = 'joao.uber@email.com'), 10.00, 'active');