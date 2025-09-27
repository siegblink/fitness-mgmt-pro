import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, Calendar, Plus, Dumbbell } from "lucide-react";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_groups: string[];
  equipment: string | null;
  difficulty_level: string | null;
  instructions: string | null;
  video_url: string | null;
}

interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  sets: number;
  reps: string | null;
  weight_kg: number | null;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
  exercise: Exercise | null;
}

interface WorkoutSession {
  id: string;
  workout_plan_id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  week_number: number | null;
  created_at: string;
  workout_exercises: WorkoutExercise[] | null;
}

interface MemberAssignment {
  id: string;
  member_id: string;
  workout_plan_id: string;
  trainer_id: string;
  assigned_at: string;
  start_date: string;
  end_date: string | null;
  status: string;
  count?: number;
  member: {
    full_name: string;
  } | null;
}

export default async function WorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get workout plan with sessions and exercises (simplified query)
  const { data: workoutPlan, error: workoutPlanError } = await supabase
    .from("workout_plans")
    .select(
      `
      *,
      workout_sessions(
        *,
        workout_exercises(
          *,
          exercise:exercises(*)
        )
      )
    `,
    )
    .eq("id", id)
    .eq("trainer_id", data.user.id)
    .single();

  // Get member assignments separately to avoid complex join issues
  const { data: memberAssignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      member:profiles!member_assignments_member_id_fkey(full_name)
    `,
    )
    .eq("workout_plan_id", id);

  if (workoutPlanError) {
    console.error("Workout plan query error:", workoutPlanError);
    redirect("/dashboard/workouts");
  }

  if (!workoutPlan) {
    console.error(
      "Workout plan not found for id:",
      id,
      "trainer_id:",
      data.user.id,
    );
    redirect("/dashboard/workouts");
  }

  // Group sessions by week
  const sessionsByWeek =
    workoutPlan.workout_sessions?.reduce(
      (acc: Record<number, WorkoutSession[]>, session: WorkoutSession) => {
        const week = session.week_number || 1;
        if (!acc[week]) acc[week] = [];
        acc[week].push(session);
        return acc;
      },
      {} as Record<number, WorkoutSession[]>,
    ) || {};

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
              <Link href="/dashboard/workouts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {workoutPlan.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {workoutPlan.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-14">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/dashboard/workouts/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/dashboard/workouts/${id}/sessions/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Link>
            </Button>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {workoutPlan.duration_weeks}
              </div>
              <p className="text-xs text-muted-foreground">weeks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                Assigned
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {memberAssignments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {workoutPlan.workout_sessions?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge
                variant={
                  workoutPlan.difficulty_level === "beginner"
                    ? "secondary"
                    : workoutPlan.difficulty_level === "intermediate"
                      ? "default"
                      : "destructive"
                }
                className="text-sm"
              >
                {workoutPlan.difficulty_level}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Goals */}
        {workoutPlan.goals && workoutPlan.goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workoutPlan.goals.map((goal: string) => (
                  <Badge key={goal} variant="outline">
                    {goal}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Workout Sessions</CardTitle>
                <CardDescription>
                  Organized training sessions for this plan
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/dashboard/workouts/${id}/sessions/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(sessionsByWeek).length > 0 ? (
              <div className="space-y-6">
                {(
                  Object.entries(sessionsByWeek) as [string, WorkoutSession[]][]
                ).map(([week, sessions]) => (
                  <div key={week} className="space-y-3">
                    <h3 className="text-lg font-medium">Week {week}</h3>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {sessions.map((session: WorkoutSession) => (
                        <Card
                          key={session.id}
                          className="hover:shadow-md transition-shadow flex flex-col"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              {session.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Day {session.day_of_week} •{" "}
                              {session.workout_exercises?.length || 0} exercises
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col space-y-3">
                            <div className="flex-1 space-y-3">
                              {session.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {session.description}
                                </p>
                              )}

                              <div className="space-y-2">
                                {session.workout_exercises
                                  ?.slice(0, 3)
                                  .map((we: WorkoutExercise) => (
                                    <div
                                      key={we.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                      <span className="flex-1">
                                        {we.exercise?.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {we.sets}x{we.reps}
                                      </span>
                                    </div>
                                  ))}
                                {(session.workout_exercises?.length || 0) >
                                  3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +
                                    {(session.workout_exercises?.length || 0) -
                                      3}{" "}
                                    more exercises
                                  </p>
                                )}
                              </div>
                            </div>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent mt-auto"
                            >
                              <Link
                                href={`/dashboard/workouts/${id}/sessions/${session.id}`}
                              >
                                View Details
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No workout sessions yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add your first workout session to start building this plan
                </p>
                <Button asChild>
                  <Link href={`/dashboard/workouts/${id}/sessions/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Session
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Members */}
        {memberAssignments && memberAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Members</CardTitle>
              <CardDescription>
                Members currently following this workout plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberAssignments.map(
                  (assignment: MemberAssignment, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {assignment.member?.full_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">
                        {assignment.member?.full_name}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
