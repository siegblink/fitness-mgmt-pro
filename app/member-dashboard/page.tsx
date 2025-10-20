import {
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Play,
  Target,
  TrendingUp,
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

export default async function MemberDashboardPage() {
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

  // Get member's assigned workout plans
  const { data: assignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      workout_plan:workout_plans(
        *,
        workout_sessions(
          *,
          workout_exercises(count)
        )
      ),
      trainer:profiles!member_assignments_trainer_id_fkey(full_name)
    `,
    )
    .eq("member_id", data.user.id)
    .eq("status", "active");

  // Get recent progress entries
  const { data: recentProgress } = await supabase
    .from("progress_entries")
    .select(
      `
      *,
      exercise:exercises(name),
      workout_session:workout_sessions(name)
    `,
    )
    .eq("member_id", data.user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Calculate some basic stats
  const totalWorkouts = recentProgress?.length || 0;
  const thisWeekWorkouts =
    recentProgress?.filter((p) => {
      const completedDate = new Date(p.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate >= weekAgo;
    }).length || 0;

  return (
    <MemberDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Ready to crush your fitness goals,{" "}
              {profile?.full_name || "Member"}?
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Plans
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Training programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                Workouts completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Days active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Workout Plans */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    My Workout Plans
                  </CardTitle>
                  <CardDescription>
                    Your assigned training programs
                  </CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href="/member-dashboard/workouts">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">
                        {assignment.workout_plan?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        by {assignment.trainer?.full_name}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {assignment.workout_plan?.difficulty_level}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{assignment.workout_plan?.duration_weeks} weeks</span>
                    <span>
                      {assignment.workout_plan?.workout_sessions?.length || 0}{" "}
                      sessions
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        Week 2 of {assignment.workout_plan?.duration_weeks}
                      </span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>

                  <Button asChild className="w-full mt-3" size="sm">
                    <Link
                      href={`/member-dashboard/workouts/${assignment.workout_plan?.id}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Training
                    </Link>
                  </Button>
                </div>
              ))}

              {(!assignments || assignments.length === 0) && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No workout plans assigned
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Contact your trainer to get started with a personalized
                    workout plan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProgress?.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {progress.exercise?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progress.workout_session?.name} •{" "}
                      {progress.sets_completed} sets
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(progress.completed_at).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {(!recentProgress || recentProgress.length === 0) && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No recent activity
                  </h3>
                  <p className="text-muted-foreground">
                    Start your first workout to see your progress here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Workout
            </CardTitle>
            <CardDescription>Your scheduled training for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workout scheduled</h3>
              <p className="text-muted-foreground mb-6">
                Take a rest day or check your workout plans for upcoming
                sessions
              </p>
              <Button asChild>
                <Link href="/member-dashboard/workouts">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Browse Workouts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberDashboardLayout>
  );
}
