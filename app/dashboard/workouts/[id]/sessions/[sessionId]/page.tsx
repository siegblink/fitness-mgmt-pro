import { ArrowLeft, Clock, Dumbbell, Edit, Hash, Weight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { createClient } from "@/lib/supabase/server";

interface WorkoutExercise {
  id?: string;
  sets: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  exercise: {
    name: string;
    description?: string;
    difficulty_level: string;
    muscle_groups: string[];
    equipment?: string;
    instructions?: string;
  };
}

const DAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get workout session with exercises and exercise details
  const { data: workoutSession } = await supabase
    .from("workout_sessions")
    .select(
      `
      *,
      workout_plans!inner(name),
      workout_exercises(
        *,
        exercise:exercises(*)
      )
    `,
    )
    .eq("id", sessionId)
    .eq("workout_plan_id", id)
    .eq("workout_plans.trainer_id", data.user.id)
    .single();

  if (!workoutSession) {
    redirect(`/dashboard/workouts/${id}`);
  }

  // Sort exercises by order_index
  const sortedExercises =
    workoutSession.workout_exercises?.sort(
      (a: WorkoutExercise, b: WorkoutExercise) => a.order_index - b.order_index,
    ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 flex-shrink-0"
              asChild
            >
              <Link href={`/dashboard/workouts/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {workoutSession.name}
                </h1>
                <Badge variant="outline" className="text-sm w-fit">
                  Week {workoutSession.week_number}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                {workoutSession.workout_plans?.name} •{" "}
                {workoutSession.day_of_week
                  ? DAY_NAMES[workoutSession.day_of_week]
                  : "No day assigned"}
              </p>
            </div>
          </div>
          <div className="sm:ml-14">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link
                href={`/dashboard/workouts/${id}/sessions/${sessionId}/edit`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Session
              </Link>
            </Button>
          </div>
        </div>

        {/* Session Overview */}
        {workoutSession.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {workoutSession.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Session Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                Exercises
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {sortedExercises.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                Total Sets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {sortedExercises.reduce(
                  (sum: number, ex: WorkoutExercise) => sum + ex.sets,
                  0,
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Est. Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {Math.ceil(
                  sortedExercises.reduce((sum: number, ex: WorkoutExercise) => {
                    const setTime = 45; // Estimated seconds per set
                    const restTime = ex.rest_seconds || 60;
                    return sum + ex.sets * (setTime + restTime);
                  }, 0) / 60,
                )}
              </div>
              <p className="text-xs text-muted-foreground">minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Weight className="h-3 w-3 sm:h-4 sm:w-4" />
                Muscle Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {
                  Array.from(
                    new Set(
                      sortedExercises.flatMap(
                        (ex: WorkoutExercise) => ex.exercise.muscle_groups,
                      ),
                    ),
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Exercises</CardTitle>
            <CardDescription>
              Complete list of exercises for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedExercises.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {sortedExercises.map(
                  (workoutExercise: WorkoutExercise, index: number) => (
                    <div
                      key={workoutExercise.id}
                      className="p-4 sm:p-6 rounded-lg border bg-card space-y-3 sm:space-y-4"
                    >
                      <div className="space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-medium leading-tight">
                                {workoutExercise.exercise.name}
                              </h3>
                              <Badge
                                variant={
                                  workoutExercise.exercise.difficulty_level ===
                                  "beginner"
                                    ? "secondary"
                                    : workoutExercise.exercise
                                          .difficulty_level === "intermediate"
                                      ? "default"
                                      : "destructive"
                                }
                                className="w-fit text-xs"
                              >
                                {workoutExercise.exercise.difficulty_level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {workoutExercise.exercise.description && (
                          <p className="text-sm text-muted-foreground ml-10 sm:ml-11">
                            {workoutExercise.exercise.description}
                          </p>
                        )}
                      </div>

                      {/* Exercise Details */}
                      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                        <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                          <div className="text-xs text-muted-foreground mb-1">
                            Sets
                          </div>
                          <div className="text-base sm:text-lg font-semibold">
                            {workoutExercise.sets}
                          </div>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                          <div className="text-xs text-muted-foreground mb-1">
                            Reps
                          </div>
                          <div className="text-base sm:text-lg font-semibold">
                            {workoutExercise.reps || "N/A"}
                          </div>
                        </div>
                        {workoutExercise.weight_kg && (
                          <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1">
                              Weight
                            </div>
                            <div className="text-base sm:text-lg font-semibold">
                              {workoutExercise.weight_kg} kg
                            </div>
                          </div>
                        )}
                        {workoutExercise.rest_seconds && (
                          <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1">
                              Rest
                            </div>
                            <div className="text-base sm:text-lg font-semibold">
                              {workoutExercise.rest_seconds}s
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Muscle Groups */}
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Target Muscles
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {workoutExercise.exercise.muscle_groups.map(
                            (group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="text-xs"
                              >
                                {group}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Equipment */}
                      {workoutExercise.exercise.equipment &&
                        workoutExercise.exercise.equipment !== "none" && (
                          <div>
                            <div className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                              Equipment Required
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workoutExercise.exercise.equipment}
                            </p>
                          </div>
                        )}

                      {/* Instructions */}
                      {workoutExercise.exercise.instructions && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Instructions
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {workoutExercise.exercise.instructions}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {workoutExercise.notes && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Trainer Notes
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            {workoutExercise.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No exercises yet</h3>
                <p className="text-muted-foreground mb-6">
                  This session doesn&apos;t have any exercises assigned yet.
                </p>
                <Button asChild>
                  <Link
                    href={`/dashboard/workouts/${id}/sessions/${sessionId}/edit`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Session
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
