import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Play,
  Target,
  User,
} from "lucide-react";
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

export default async function MemberWorkoutPlanPage({
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

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "member") {
    redirect("/dashboard");
  }

  // Get workout plan assignment for this member
  const { data: assignment } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      workout_plan:workout_plans(
        *,
        workout_sessions(
          *,
          workout_exercises(
            *,
            exercise:exercises(*)
          )
        )
      ),
      trainer:profiles!member_assignments_trainer_id_fkey(full_name, email)
    `,
    )
    .eq("member_id", data.user.id)
    .eq("workout_plan_id", id)
    .single();

  if (!assignment) {
    redirect("/member-dashboard/workouts");
  }

  // Group sessions by week
  const sessionsByWeek =
    assignment.workout_plan?.workout_sessions?.reduce(
      (acc: Record<number, WorkoutSession[]>, session: WorkoutSession) => {
        const week = session.week_number || 1;
        if (!acc[week]) acc[week] = [];
        acc[week].push(session);
        return acc;
      },
      {} as Record<number, WorkoutSession[]>,
    ) || {};

  // Get member's progress for this plan
  const { data: progressEntries } = await supabase
    .from("progress_entries")
    .select(
      `
      *,
      workout_session:workout_sessions(name),
      exercise:exercises(name)
    `,
    )
    .eq("member_id", data.user.id)
    .in(
      "workout_session_id",
      assignment.workout_plan?.workout_sessions?.map(
        (s: WorkoutSession) => s.id,
      ) || [],
    );

  const completedSessions = new Set(
    progressEntries?.map((p) => p.workout_session_id) || [],
  );

  return (
    <MemberDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/member-dashboard/workouts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {assignment.workout_plan?.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {assignment.trainer?.full_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {assignment.workout_plan?.duration_weeks} weeks
              </span>
              <Badge
                variant={
                  assignment.status === "active" ? "default" : "secondary"
                }
              >
                {assignment.status}
              </Badge>
            </p>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignment.workout_plan?.duration_weeks}
              </div>
              <p className="text-xs text-muted-foreground">weeks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignment.workout_plan?.workout_sessions?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions.size}</div>
              <p className="text-xs text-muted-foreground">sessions done</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (completedSessions.size /
                    (assignment.workout_plan?.workout_sessions?.length || 1)) *
                    100,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Description and Goals */}
        <div className="grid gap-6 lg:grid-cols-2">
          {assignment.workout_plan?.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {assignment.workout_plan.description}
                </p>
              </CardContent>
            </Card>
          )}

          {assignment.workout_plan?.goals &&
            assignment.workout_plan.goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Training Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {assignment.workout_plan.goals.map((goal: string) => (
                      <Badge key={goal} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Progress
            </CardTitle>
            <CardDescription>
              Track your completion through the workout plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-muted-foreground">
                  {completedSessions.size} of{" "}
                  {assignment.workout_plan?.workout_sessions?.length || 0}{" "}
                  sessions
                </span>
              </div>
              <Progress
                value={
                  (completedSessions.size /
                    (assignment.workout_plan?.workout_sessions?.length || 1)) *
                  100
                }
                className="h-3"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Started {new Date(assignment.assigned_at).toLocaleDateString()}
              </span>
              <span>
                {Math.round(
                  (completedSessions.size /
                    (assignment.workout_plan?.workout_sessions?.length || 1)) *
                    100,
                )}
                % complete
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Workout Sessions by Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Workout Sessions
            </CardTitle>
            <CardDescription>
              Complete your training sessions week by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(sessionsByWeek).length > 0 ? (
              <div className="space-y-8">
                {(
                  Object.entries(sessionsByWeek) as [string, WorkoutSession[]][]
                ).map(([week, sessions]) => (
                  <div key={week} className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      Week {week}
                      <Badge variant="outline" className="text-xs">
                        {
                          sessions.filter((s: WorkoutSession) =>
                            completedSessions.has(s.id),
                          ).length
                        }{" "}
                        of {sessions.length} completed
                      </Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {sessions.map((session: WorkoutSession) => {
                        const isCompleted = completedSessions.has(session.id);
                        return (
                          <Card
                            key={session.id}
                            className={`hover:shadow-md transition-shadow ${isCompleted ? "bg-primary/5 border-primary/20" : ""}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {session.name}
                                </CardTitle>
                                {isCompleted && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-sm">
                                Day {session.day_of_week} •{" "}
                                {session.workout_exercises?.length || 0}{" "}
                                exercises
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
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

                              <Button
                                asChild
                                variant={isCompleted ? "outline" : "default"}
                                size="sm"
                                className="w-full"
                              >
                                <Link
                                  href={`/member-dashboard/workouts/${id}/sessions/${session.id}`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Review Session
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Start Session
                                    </>
                                  )}
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No workout sessions available
                </h3>
                <p className="text-muted-foreground">
                  This workout plan doesn&apos;t have any sessions configured
                  yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberDashboardLayout>
  );
}
