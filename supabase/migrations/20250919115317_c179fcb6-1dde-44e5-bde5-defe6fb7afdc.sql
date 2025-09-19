-- Remove the overly permissive public access policy for affiliates
DROP POLICY IF EXISTS "Anyone can view active affiliates" ON public.affiliates;

-- Update the admin policy to be more specific and secure
DROP POLICY IF EXISTS "Admins can manage affiliates" ON public.affiliates;

-- Create a restrictive policy that only allows authenticated users to manage affiliates
-- Note: This requires proper Supabase authentication to be implemented
CREATE POLICY "Authenticated users can manage affiliates" 
ON public.affiliates 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create a more restrictive SELECT policy for affiliate data
-- Only authenticated users can view affiliate data
CREATE POLICY "Authenticated users can view affiliates" 
ON public.affiliates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);