-- Add RLS policy to allow trainers to view profiles of their assigned members
-- This is needed for joins in meal_plan_assignments and member_assignments queries

CREATE POLICY "Trainers can view assigned member profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.member_assignments
      WHERE member_id = profiles.id AND trainer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.meal_plan_assignments
      WHERE member_id = profiles.id AND trainer_id = auth.uid()
    )
  );
