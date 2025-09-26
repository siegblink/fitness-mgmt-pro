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
import {
  Users,
  Dumbbell,
  TrendingUp,
  MessageCircle,
  Plus,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
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

  if (profile?.role !== "trainer") {
    redirect("/member-dashboard");
  }

  // Get dashboard stats
  const { data: memberCount } = await supabase
    .from("member_assignments")
    .select("member_id", { count: "exact" })
    .eq("trainer_id", data.user.id)
    .eq("status", "active");

  const { data: workoutPlans } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("trainer_id", data.user.id)
    .limit(5);

  const { data: recentMessages } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(full_name)")
    .eq("recipient_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: activeAssignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      member:profiles!member_assignments_member_id_fkey(full_name),
      workout_plan:workout_plans(name)
    `,
    )
    .eq("trainer_id", data.user.id)
    .eq("status", "active")
    .limit(5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || "Trainer"}
            </p>
          </div>
          <Button asChild className="mt-1">
            <Link href="/dashboard/workouts/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Workout Plan
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberCount?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Workout Plans
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workoutPlans?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active training programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Completed workouts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentMessages?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest member assignments and progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAssignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {assignment.member?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.workout_plan?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
              {(!activeAssignments || activeAssignments.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active assignments yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/dashboard/workouts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Workout Plan
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/dashboard/members">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Members
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/dashboard/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/dashboard/messages">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Check Messages
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Workout Plans Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Workout Plans</CardTitle>
                <CardDescription>
                  Manage and track your training programs
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/workouts">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workoutPlans?.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration_weeks} weeks • {plan.difficulty_level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{plan.difficulty_level}</Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/workouts/${plan.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(!workoutPlans || workoutPlans.length === 0) && (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No workout plans yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first workout plan to get started
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/workouts/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workout Plan
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
