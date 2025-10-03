-- Create meal plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  duration_days INTEGER,
  dietary_type TEXT, -- e.g., 'balanced', 'low-carb', 'high-protein', 'vegan', 'vegetarian'
  goals TEXT[], -- e.g., 'weight-loss', 'muscle-gain', 'maintenance'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal items table
CREATE TABLE IF NOT EXISTS public.meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT,
  calories INTEGER,
  protein_grams DECIMAL,
  carbs_grams DECIMAL,
  fats_grams DECIMAL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal plan assignments table
CREATE TABLE IF NOT EXISTS public.meal_plan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id),
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  UNIQUE(member_id, meal_plan_id, status)
);

-- Enable Row Level Security
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal plans
CREATE POLICY "Trainers can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Members can view assigned meal plans" ON public.meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plan_assignments
      WHERE member_id = auth.uid() AND meal_plan_id = id
    )
  );

CREATE POLICY "Trainers can create meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (trainer_id = auth.uid());

-- RLS Policies for meal items
CREATE POLICY "Users can view meal items for accessible plans" ON public.meal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = meal_plan_id AND (
        mp.trainer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.meal_plan_assignments mpa
          WHERE mpa.member_id = auth.uid() AND mpa.meal_plan_id = mp.id
        )
      )
    )
  );

CREATE POLICY "Trainers can manage meal items for their plans" ON public.meal_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = meal_plan_id AND mp.trainer_id = auth.uid()
    )
  );

-- RLS Policies for meal plan assignments
CREATE POLICY "Trainers can view their meal plan assignments" ON public.meal_plan_assignments
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Members can view their own meal plan assignments" ON public.meal_plan_assignments
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Trainers can create meal plan assignments" ON public.meal_plan_assignments
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their meal plan assignments" ON public.meal_plan_assignments
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete their meal plan assignments" ON public.meal_plan_assignments
  FOR DELETE USING (trainer_id = auth.uid());
