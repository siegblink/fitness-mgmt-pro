-- Insert sample exercises
INSERT INTO public.exercises (name, description, muscle_groups, equipment, difficulty_level, instructions) VALUES
('Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'shoulders', 'triceps'], 'none', 'beginner', 'Start in plank position, lower body to ground, push back up'),
('Squats', 'Fundamental lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'none', 'beginner', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'),
('Deadlifts', 'Compound pulling exercise', ARRAY['hamstrings', 'glutes', 'back', 'traps'], 'barbell', 'intermediate', 'Stand with feet hip-width apart, hinge at hips, lower bar to ground, return to standing'),
('Bench Press', 'Upper body pressing exercise', ARRAY['chest', 'shoulders', 'triceps'], 'barbell', 'intermediate', 'Lie on bench, lower bar to chest, press back up'),
('Pull-ups', 'Upper body pulling exercise', ARRAY['back', 'biceps'], 'pull-up bar', 'intermediate', 'Hang from bar, pull body up until chin clears bar, lower with control'),
('Plank', 'Core stability exercise', ARRAY['core', 'shoulders'], 'none', 'beginner', 'Hold push-up position with forearms on ground, maintain straight line from head to heels'),
('Lunges', 'Single-leg lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'none', 'beginner', 'Step forward into lunge position, lower back knee toward ground, return to standing'),
('Overhead Press', 'Vertical pushing exercise', ARRAY['shoulders', 'triceps', 'core'], 'barbell', 'intermediate', 'Stand with feet hip-width apart, press bar from shoulders overhead, lower with control'),
('Rows', 'Horizontal pulling exercise', ARRAY['back', 'biceps'], 'barbell', 'intermediate', 'Hinge at hips, pull bar to lower chest, lower with control'),
('Burpees', 'Full-body conditioning exercise', ARRAY['full body'], 'none', 'advanced', 'Drop to push-up position, perform push-up, jump feet to hands, jump up with arms overhead')
ON CONFLICT DO NOTHING;
