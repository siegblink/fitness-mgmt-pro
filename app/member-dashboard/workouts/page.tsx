import { Calendar, Dumbbell, Play, Target, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

interface WorkoutSession {
  id: string;
  name: string;
  day_of_week: number | null;
  week_number: number | null;
  workout_exercises?: Array<{ count: number }>;
}

export default async function MemberWorkoutsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "member") {
    redirect("/dashboard");
  }

  // Get member's assigned workout plans with detailed information
  const { data: assignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      workout_plan:workout_plans(
        *,
        workout_sessions(
          id,
          name,
          day_of_week,
          week_number,
          workout_exercises(count)
        )
      ),
      trainer:profiles!member_assignments_trainer_id_fkey(full_name, email)
    `,
    )
    .eq("member_id", data.user.id)
    .order("assigned_at", { ascending: false });

  return (
    <MemberDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Workouts</h1>
          <p className="text-muted-foreground">
            Access your assigned workout plans and track your progress
          </p>
        </div>

        {/* Active Workout Plans */}
        <div className="space-y-6">
          {assignments
            ?.filter((a) => a.status === "active")
            .map((assignment) => (
              <Card
                key={assignment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {assignment.workout_plan?.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {assignment.trainer?.full_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {assignment.workout_plan?.duration_weeks} weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          {assignment.workout_plan?.workout_sessions?.length ||
                            0}{" "}
                          sessions
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          assignment.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assignment.status}
                      </Badge>
                      <Badge
                        variant={
                          assignment.workout_plan?.difficulty_level ===
                          "beginner"
                            ? "secondary"
                            : assignment.workout_plan?.difficulty_level ===
                                "intermediate"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {assignment.workout_plan?.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  {assignment.workout_plan?.description && (
                    <p className="text-muted-foreground">
                      {assignment.workout_plan.description}
                    </p>
                  )}

                  {/* Goals */}
                  {assignment.workout_plan?.goals &&
                    assignment.workout_plan.goals.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Training Goals:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assignment.workout_plan.goals.map((goal: string) => (
                            <Badge
                              key={goal}
                              variant="outline"
                              className="text-xs"
                            >
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Progress</h4>
                      <span className="text-sm text-muted-foreground">
                        Week 2 of {assignment.workout_plan?.duration_weeks}
                      </span>
                    </div>
                    <Progress value={25} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Started{" "}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                      <span>25% complete</span>
                    </div>
                  </div>

                  {/* Workout Sessions Preview */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Upcoming Sessions</h4>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {assignment.workout_plan?.workout_sessions
                        ?.slice(0, 6)
                        .map((session: WorkoutSession) => (
                          <div
                            key={session.id}
                            className="p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium">
                                {session.name}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                Week {session.week_number}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Day {session.day_of_week} •{" "}
                              {session.workout_exercises?.[0]?.count || 0}{" "}
                              exercises
                            </p>
                          </div>
                        ))}
                    </div>
                    {(assignment.workout_plan?.workout_sessions?.length || 0) >
                      6 && (
                      <p className="text-xs text-muted-foreground">
                        +{assignment.workout_plan.workout_sessions.length - 6}{" "}
                        more sessions
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button asChild className="flex-1">
                      <Link
                        href={`/member-dashboard/workouts/${assignment.workout_plan?.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        href={`/member-dashboard/progress?plan=${assignment.workout_plan?.id}`}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        View Progress
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          {/* Completed Plans */}
          {assignments &&
            assignments.filter((a) => a.status === "completed").length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Completed Plans</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {assignments
                    .filter((a) => a.status === "completed")
                    .map((assignment) => (
                      <Card key={assignment.id} className="opacity-75">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {assignment.workout_plan?.name}
                          </CardTitle>
                          <CardDescription>
                            Completed •{" "}
                            {assignment.workout_plan?.duration_weeks} weeks
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Completed</Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/member-dashboard/workouts/${assignment.workout_plan?.id}`}
                              >
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

          {(!assignments || assignments.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No workout plans assigned
                </h3>
                <p className="text-muted-foreground mb-6">
                  Contact your trainer to get started with a personalized
                  workout plan
                </p>
                <Button asChild>
                  <Link href="/member-dashboard/messages">Message Trainer</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MemberDashboardLayout>
  );
}
