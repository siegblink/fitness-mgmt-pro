"use client";

import {
  ArrowLeft,
  Dumbbell,
  Info,
  Plus,
  Save,
  Search,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  equipment: string;
  difficulty_level: string;
  instructions?: string;
}

interface WorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
}

interface WorkoutSession {
  id: string;
  name: string;
  description?: string;
  day_of_week: number;
  week_number: number;
  workout_plan_id: string;
}

// Common workout presets
const WORKOUT_PRESETS = [
  { label: "3x10", sets: 3, reps: "10", rest: 60 },
  { label: "4x8", sets: 4, reps: "8", rest: 90 },
  { label: "5x5", sets: 5, reps: "5", rest: 120 },
  { label: "3x8-12", sets: 3, reps: "8-12", rest: 60 },
  { label: "4x6-8", sets: 4, reps: "6-8", rest: 90 },
];

function ExercisePreview({ exercise }: { exercise: Exercise }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Info className="h-3 w-3 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {exercise.name}
            <Badge
              variant={
                exercise.difficulty_level === "beginner"
                  ? "secondary"
                  : exercise.difficulty_level === "intermediate"
                    ? "default"
                    : "destructive"
              }
              className="text-xs"
            >
              {exercise.difficulty_level}
            </Badge>
          </DialogTitle>
          <DialogDescription>{exercise.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Muscle Groups</h4>
            <div className="flex flex-wrap gap-2">
              {exercise.muscle_groups.map((group) => (
                <Badge key={group} variant="outline" className="text-sm">
                  {group}
                </Badge>
              ))}
            </div>
          </div>

          {exercise.equipment && exercise.equipment !== "none" && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Equipment
              </h4>
              <p className="text-sm text-muted-foreground">
                {exercise.equipment}
              </p>
            </div>
          )}

          {exercise.instructions && (
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.instructions}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EditWorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const [workoutPlanId, setWorkoutPlanId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    day_of_week: "",
    week_number: "1",
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    if (!workoutPlanId || !sessionId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          router.push("/auth/login");
          return;
        }

        // Fetch session data with exercises
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
          .eq("workout_plan_id", workoutPlanId)
          .single();

        if (sessionError || !sessionData) {
          throw new Error("Session not found");
        }

        setSession(sessionData);
        setFormData({
          name: sessionData.name,
          description: sessionData.description || "",
          day_of_week: sessionData.day_of_week.toString(),
          week_number: sessionData.week_number.toString(),
        });

        // Set selected exercises
        const sortedExercises =
          sessionData.workout_exercises?.sort(
            (a: WorkoutExercise, b: WorkoutExercise) =>
              a.order_index - b.order_index,
          ) || [];

        setSelectedExercises(
          sortedExercises.map((we: WorkoutExercise) => ({
            id: we.id,
            exercise_id: we.exercise_id,
            exercise: we.exercise,
            sets: we.sets,
            reps: we.reps,
            weight_kg: we.weight_kg,
            rest_seconds: we.rest_seconds,
            notes: we.notes,
            order_index: we.order_index,
          })),
        );

        // Fetch all available exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("exercises")
          .select("*")
          .order("name");

        if (exercisesError) throw exercisesError;
        if (exercisesData) setExercises(exercisesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workoutPlanId, sessionId, supabase, router]);

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle_groups.some((mg) =>
        mg.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const addExercise = (exercise: Exercise) => {
    if (!selectedExercises.find((se) => se.exercise_id === exercise.id)) {
      setSelectedExercises((prev) => [
        ...prev,
        {
          exercise_id: exercise.id,
          exercise,
          sets: 3,
          reps: "10",
          rest_seconds: 60,
          order_index: prev.length,
        },
      ]);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev
        .filter((se) => se.exercise_id !== exerciseId)
        .map((se, index) => ({ ...se, order_index: index })),
    );
  };

  const updateExercise = (
    exerciseId: string,
    updates: Partial<WorkoutExercise>,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((se) =>
        se.exercise_id === exerciseId ? { ...se, ...updates } : se,
      ),
    );
  };

  const applyPreset = (
    exerciseId: string,
    preset: (typeof WORKOUT_PRESETS)[0],
  ) => {
    updateExercise(exerciseId, {
      sets: preset.sets,
      reps: preset.reps,
      rest_seconds: preset.rest,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update workout session
      const { error: sessionError } = await supabase
        .from("workout_sessions")
        .update({
          name: formData.name,
          description: formData.description,
          day_of_week: Number.parseInt(formData.day_of_week, 10),
          week_number: Number.parseInt(formData.week_number, 10),
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      // Delete existing workout exercises
      const { error: deleteError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_session_id", sessionId);

      if (deleteError) throw deleteError;

      // Add new exercises to session
      if (selectedExercises.length > 0) {
        const workoutExercises = selectedExercises.map((se) => ({
          workout_session_id: sessionId,
          exercise_id: se.exercise_id,
          sets: se.sets,
          reps: se.reps,
          weight_kg: se.weight_kg,
          rest_seconds: se.rest_seconds,
          notes: se.notes,
          order_index: se.order_index,
        }));

        const { error: exercisesError } = await supabase
          .from("workout_exercises")
          .insert(workoutExercises);

        if (exercisesError) throw exercisesError;
      }

      router.push(`/dashboard/workouts/${workoutPlanId}/sessions/${sessionId}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button asChild>
              <Link href={`/dashboard/workouts/${workoutPlanId}`}>
                Back to Workout Plan
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" className="mt-1" asChild>
            <Link
              href={`/dashboard/workouts/${workoutPlanId}/sessions/${sessionId}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Workout Session
            </h1>
            <p className="text-muted-foreground">
              Modify your training session details and exercises
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                Update the basic information for this workout session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Upper Body Strength"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the focus and goals of this session..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="week">Week Number *</Label>
                  <Select
                    value={formData.week_number}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, week_number: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem
                          // biome-ignore lint/suspicious/noArrayIndexKey: Static week numbers 1-12
                          key={i + 1}
                          value={(i + 1).toString()}
                        >
                          Week {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day of Week *</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, day_of_week: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="7">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Selection */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Available Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Library</CardTitle>
                <CardDescription>
                  Search and add exercises to your session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{exercise.name}</h4>
                            {exercise.equipment &&
                              exercise.equipment !== "none" && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Dumbbell className="h-3 w-3" />
                                  <span>{exercise.equipment}</span>
                                </div>
                              )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                exercise.difficulty_level === "beginner"
                                  ? "secondary"
                                  : exercise.difficulty_level === "intermediate"
                                    ? "default"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {exercise.difficulty_level}
                            </Badge>
                            {exercise.muscle_groups.map((group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="text-xs"
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>

                          {exercise.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {exercise.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <ExercisePreview exercise={exercise} />
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addExercise(exercise)}
                          disabled={selectedExercises.some(
                            (se) => se.exercise_id === exercise.id,
                          )}
                          className="ml-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Session Exercises ({selectedExercises.length})
                </CardTitle>
                <CardDescription>
                  Configure sets, reps, and other parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedExercises.map((workoutExercise) => (
                    <div
                      key={workoutExercise.exercise_id}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {workoutExercise.exercise.name}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeExercise(workoutExercise.exercise_id)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <Label className="text-xs flex items-center gap-1 mb-2">
                          <Zap className="h-3 w-3" />
                          Quick Presets
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {WORKOUT_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() =>
                                applyPreset(workoutExercise.exercise_id, preset)
                              }
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            value={workoutExercise.sets}
                            onChange={(e) =>
                              updateExercise(workoutExercise.exercise_id, {
                                sets: Number.parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps</Label>
                          <Input
                            placeholder="10 or 8-12"
                            value={workoutExercise.reps}
                            onChange={(e) =>
                              updateExercise(workoutExercise.exercise_id, {
                                reps: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Weight (kg)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Optional"
                            value={workoutExercise.weight_kg || ""}
                            onChange={(e) =>
                              updateExercise(workoutExercise.exercise_id, {
                                weight_kg: e.target.value
                                  ? Number.parseFloat(e.target.value)
                                  : undefined,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rest (sec)</Label>
                          <Input
                            type="number"
                            value={workoutExercise.rest_seconds || ""}
                            onChange={(e) =>
                              updateExercise(workoutExercise.exercise_id, {
                                rest_seconds:
                                  Number.parseInt(e.target.value, 10) ||
                                  undefined,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">
                          Trainer Notes (Optional)
                        </Label>
                        <Input
                          placeholder="Special instructions or modifications..."
                          value={workoutExercise.notes || ""}
                          onChange={(e) =>
                            updateExercise(workoutExercise.exercise_id, {
                              notes: e.target.value || undefined,
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}

                  {selectedExercises.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No exercises selected yet</p>
                      <p className="text-sm">
                        Search and add exercises from the library
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link
                href={`/dashboard/workouts/${workoutPlanId}/sessions/${sessionId}`}
              >
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
