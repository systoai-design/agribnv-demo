-- Create cancellation policy enum
CREATE TYPE public.cancellation_policy AS ENUM (
  'flexible',
  'moderate', 
  'strict',
  'non_refundable'
);

-- Add property settings columns
ALTER TABLE public.properties 
ADD COLUMN check_in_time text DEFAULT '14:00',
ADD COLUMN check_out_time text DEFAULT '12:00',
ADD COLUMN house_rules text[] DEFAULT '{}',
ADD COLUMN safety_features text[] DEFAULT '{}',
ADD COLUMN cancellation_policy public.cancellation_policy DEFAULT 'moderate',
ADD COLUMN additional_rules text;