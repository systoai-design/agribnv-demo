-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own guest role" ON public.user_roles;

-- Create a new policy that allows users to insert either guest or host role for themselves
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());