"use client";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Dumbbell,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MemberDashboardLayout from "@/components/member-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  exercise: {
    id: string;
    name: string;
    description?: string;
    muscle_groups: string[];
    equipment?: string;
    instructions?: string;
  };
}

interface ExerciseLog {
  exercise_id: string;
  sets_completed: number;
  reps_completed: string;
  weight_used_kg?: number;
  notes?: string;
}

interface WorkoutSession {
  id: string;
  workout_plan_id: string;
  name: string;
  description?: string;
  day_of_week?: number;
  week_number?: number;
  created_at: string;
  workout_exercises?: WorkoutExercise[];
}

export default function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const [workoutPlanId, setWorkoutPlanId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setWorkoutPlanId(resolvedParams.id);
      setSessionId(resolvedParams.sessionId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Get session with exercises
        const { data: sessionData, error: sessionError } = await supabase
          .from("workout_sessions")
          .select(
            `
            *,
            workout_exercises(
              *,
              exercise:exercises(*)
            )
          `,
          )
          .eq("id", sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);
        setExercises(sessionData.workout_exercises || []);

        // Initialize exercise logs
        const initialLogs: Record<string, ExerciseLog> = {};
        sessionData.workout_exercises?.forEach((we: WorkoutExercise) => {
          initialLogs[we.exercise_id] = {
            exercise_id: we.exercise_id,
            sets_completed: 0,
            reps_completed: we.reps,
            weight_used_kg: we.weight_kg,
            notes: "",
          };
        });
        setExerciseLogs(initialLogs);

        // Check if already completed
        const { data: existingProgress } = await supabase
          .from("progress_entries")
          .select("*")
          .eq("member_id", user.id)
          .eq("workout_session_id", sessionId);

        if (existingProgress && existingProgress.length > 0) {
          // Load existing progress
          const existingLogs: Record<string, ExerciseLog> = {};
          existingProgress.forEach((entry) => {
            existingLogs[entry.exercise_id] = {
              exercise_id: entry.exercise_id,
              sets_completed: entry.sets_completed || 0,
              reps_completed: entry.reps_completed || "",
              weight_used_kg: entry.weight_used_kg,
              notes: entry.notes || "",
            };
          });
          setExerciseLogs(existingLogs);
        }
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, supabase]);

  const updateExerciseLog = (
    exerciseId: string,
    updates: Partial<ExerciseLog>,
  ) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], ...updates },
    }));
  };

  const completeWorkout = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete existing progress entries for this session
      await supabase
        .from("progress_entries")
        .delete()
        .eq("member_id", user.id)
        .eq("workout_session_id", sessionId);

      // Insert new progress entries
      const progressEntries = Object.values(exerciseLogs)
        .filter((log) => log.sets_completed > 0)
        .map((log) => ({
          member_id: user.id,
          workout_session_id: sessionId,
          exercise_id: log.exercise_id,
          sets_completed: log.sets_completed,
          reps_completed: log.reps_completed,
          weight_used_kg: log.weight_used_kg,
          notes: log.notes,
        }));

      if (progressEntries.length > 0) {
        const { error } = await supabase
          .from("progress_entries")
          .insert(progressEntries);
        if (error) throw error;
      }

      router.push(`/member-dashboard/workouts/${workoutPlanId}`);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <MemberDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading workout session...</p>
          </div>
        </div>
      </MemberDashboardLayout>
    );
  }

  if (error) {
    return (
      <MemberDashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button asChild className="mt-4">
            <Link href={`/member-dashboard/workouts/${workoutPlanId}`}>
              Back to Workout Plan
            </Link>
          </Button>
        </div>
      </MemberDashboardLayout>
    );
  }

  const completedExercises = Object.values(exerciseLogs).filter(
    (log) => log.sets_completed > 0,
  ).length;
  const totalExercises = exercises.length;

  return (
    <MemberDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/member-dashboard/workouts/${workoutPlanId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {session?.name}
            </h1>
            <p className="text-muted-foreground">
              Week {session?.week_number} • Day {session?.day_of_week} •{" "}
              {exercises.length} exercises
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedExercises}/{totalExercises} completed
            </Badge>
          </div>
        </div>

        {/* Session Description */}
        {session?.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{session.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <div className="space-y-4">
          {exercises.map((workoutExercise, index) => {
            const log = exerciseLogs[workoutExercise.exercise_id] || {
              exercise_id: workoutExercise.exercise_id,
              sets_completed: 0,
              reps_completed: workoutExercise.reps,
              weight_used_kg: workoutExercise.weight_kg,
              notes: "",
            };

            return (
              <Card
                key={workoutExercise.id}
                className={
                  log.sets_completed > 0 ? "border-primary/50 bg-primary/5" : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-sm font-normal text-muted-foreground">
                          #{index + 1}
                        </span>
                        {workoutExercise.exercise.name}
                        {log.sets_completed > 0 && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Target: {workoutExercise.sets} sets ×{" "}
                        {workoutExercise.reps} reps
                        {workoutExercise.weight_kg &&
                          ` @ ${workoutExercise.weight_kg}kg`}
                        {workoutExercise.rest_seconds &&
                          ` • ${workoutExercise.rest_seconds}s rest`}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workoutExercise.exercise.muscle_groups.join(", ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Exercise Instructions */}
                  {workoutExercise.exercise.instructions && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {workoutExercise.exercise.instructions}
                      </p>
                    </div>
                  )}

                  {/* Logging Interface */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Sets Completed</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateExerciseLog(workoutExercise.exercise_id, {
                              sets_completed: Math.max(
                                0,
                                log.sets_completed - 1,
                              ),
                            })
                          }
                          disabled={log.sets_completed <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={log.sets_completed}
                          onChange={(e) =>
                            updateExerciseLog(workoutExercise.exercise_id, {
                              sets_completed:
                                Number.parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateExerciseLog(workoutExercise.exercise_id, {
                              sets_completed: log.sets_completed + 1,
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Reps Completed</Label>
                      <Input
                        placeholder="e.g., 10 or 8-12"
                        value={log.reps_completed}
                        onChange={(e) =>
                          updateExerciseLog(workoutExercise.exercise_id, {
                            reps_completed: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Weight Used (kg)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Optional"
                        value={log.weight_used_kg || ""}
                        onChange={(e) =>
                          updateExerciseLog(workoutExercise.exercise_id, {
                            weight_used_kg: e.target.value
                              ? Number.parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Rest Timer</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {workoutExercise.rest_seconds
                            ? `${workoutExercise.rest_seconds}s`
                            : "No timer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm">Notes (optional)</Label>
                    <Textarea
                      placeholder="How did this exercise feel? Any observations..."
                      value={log.notes}
                      onChange={(e) =>
                        updateExerciseLog(workoutExercise.exercise_id, {
                          notes: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Complete Workout */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Ready to finish your workout?
                </h3>
                <p className="text-muted-foreground">
                  You&apos;ve completed {completedExercises} out of{" "}
                  {totalExercises} exercises
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/member-dashboard/workouts/${workoutPlanId}`}>
                    Save & Exit
                  </Link>
                </Button>
                <Button
                  onClick={completeWorkout}
                  disabled={isCompleting || completedExercises === 0}
                >
                  {isCompleting ? "Completing..." : "Complete Workout"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberDashboardLayout>
  );
}
