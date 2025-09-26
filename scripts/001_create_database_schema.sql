-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('trainer', 'member')),
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT,
  video_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout plans table
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  duration_weeks INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout sessions table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  week_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout exercises table (junction table)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  sets INTEGER NOT NULL,
  reps TEXT, -- Can be "8-12" or "10" etc.
  weight_kg DECIMAL,
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL
);

-- Create member assignments table
CREATE TABLE IF NOT EXISTS public.member_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id),
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  UNIQUE(member_id, workout_plan_id)
);

-- Create progress tracking table
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  sets_completed INTEGER,
  reps_completed TEXT,
  weight_used_kg DECIMAL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for trainer-member communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  subject TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for exercises (trainers can create, everyone can view)
CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Trainers can create exercises" ON public.exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their own exercises" ON public.exercises
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- RLS Policies for workout plans
CREATE POLICY "Trainers can view their own workout plans" ON public.workout_plans
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Members can view assigned workout plans" ON public.workout_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.member_assignments 
      WHERE member_id = auth.uid() AND workout_plan_id = id
    )
  );

CREATE POLICY "Trainers can create workout plans" ON public.workout_plans
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their own workout plans" ON public.workout_plans
  FOR UPDATE USING (trainer_id = auth.uid());

-- RLS Policies for workout sessions
CREATE POLICY "Users can view workout sessions for accessible plans" ON public.workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      WHERE wp.id = workout_plan_id AND (
        wp.trainer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.member_assignments ma
          WHERE ma.member_id = auth.uid() AND ma.workout_plan_id = wp.id
        )
      )
    )
  );

CREATE POLICY "Trainers can manage workout sessions for their plans" ON public.workout_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      WHERE wp.id = workout_plan_id AND wp.trainer_id = auth.uid()
    )
  );

-- RLS Policies for workout exercises
CREATE POLICY "Users can view workout exercises for accessible sessions" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      JOIN public.workout_plans wp ON wp.id = ws.workout_plan_id
      WHERE ws.id = workout_session_id AND (
        wp.trainer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.member_assignments ma
          WHERE ma.member_id = auth.uid() AND ma.workout_plan_id = wp.id
        )
      )
    )
  );

CREATE POLICY "Trainers can manage workout exercises for their sessions" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      JOIN public.workout_plans wp ON wp.id = ws.workout_plan_id
      WHERE ws.id = workout_session_id AND wp.trainer_id = auth.uid()
    )
  );

-- RLS Policies for member assignments
CREATE POLICY "Trainers can view their member assignments" ON public.member_assignments
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Members can view their own assignments" ON public.member_assignments
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Trainers can create member assignments" ON public.member_assignments
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their member assignments" ON public.member_assignments
  FOR UPDATE USING (trainer_id = auth.uid());

-- RLS Policies for progress entries
CREATE POLICY "Members can view their own progress" ON public.progress_entries
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Trainers can view progress of their assigned members" ON public.progress_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.member_assignments ma
      WHERE ma.member_id = progress_entries.member_id AND ma.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Members can create their own progress entries" ON public.progress_entries
  FOR INSERT WITH CHECK (member_id = auth.uid());

CREATE POLICY "Members can update their own progress entries" ON public.progress_entries
  FOR UPDATE USING (member_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent or received" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received (mark as read)" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());
