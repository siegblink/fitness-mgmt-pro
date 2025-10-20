import {
  Calendar,
  Mail,
  MoreHorizontal,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
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

  // Get member assignments
  const { data: rawAssignments, error: rawError } = await supabase
    .from("member_assignments")
    .select("*")
    .eq("trainer_id", data.user.id)
    .eq("status", "active")
    .order("assigned_at", { ascending: false });

  // Fetch member profiles separately
  let memberAssignments = rawAssignments || [];
  const assignmentsError = rawError;

  if (rawAssignments && rawAssignments.length > 0) {
    // Get all member IDs
    const memberIds = rawAssignments.map((a) => a.member_id);
    const workoutPlanIds = rawAssignments
      .map((a) => a.workout_plan_id)
      .filter(Boolean);

    // Fetch profiles for all members
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .in("id", memberIds);

    // Fetch workout plans
    const { data: workoutPlans } =
      workoutPlanIds.length > 0
        ? await supabase
            .from("workout_plans")
            .select("id, name, difficulty_level")
            .in("id", workoutPlanIds)
        : { data: [] };

    // Combine the data
    memberAssignments = rawAssignments.map((assignment) => ({
      ...assignment,
      member: profiles?.find((p) => p.id === assignment.member_id) || null,
      workout_plan:
        workoutPlans?.find((w) => w.id === assignment.workout_plan_id) || null,
    }));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Members
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your assigned members and their progress
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/members/assign">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Assign Member</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 w-full bg-background"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <span className="mr-2">Filter</span>
                <span className="text-xs">▼</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Your Members ({memberAssignments?.length || 0})
            </CardTitle>
            <CardDescription className="text-sm">
              Track and manage your assigned members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsError && (
              <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
                <p className="font-semibold">Error loading members:</p>
                <p className="text-sm">{assignmentsError.message}</p>
              </div>
            )}
            <div className="space-y-3">
              {memberAssignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="group relative p-4 sm:p-5 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Member Info Section - Left Side */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-base sm:text-lg font-semibold text-primary">
                          {assignment.member?.full_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">
                          {assignment.member?.full_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {assignment.member?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>
                            Joined{" "}
                            {new Date(
                              assignment.member?.created_at || "",
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Workout Plan Section - Center/Right on Desktop */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      {/* Workout Plan Info */}
                      <div className="sm:min-w-[180px] lg:min-w-[220px]">
                        {assignment.workout_plan?.name && (
                          <p className="text-sm font-medium text-foreground mb-1.5">
                            {assignment.workout_plan.name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={
                              assignment.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {assignment.status}
                          </Badge>
                          {assignment.workout_plan?.difficulty_level && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {assignment.workout_plan.difficulty_level}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Right Side */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                        >
                          <Link
                            href={`/dashboard/messages?member=${assignment.member_id}`}
                            title="Send Message"
                          >
                            <Mail className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                        >
                          <Link
                            href={`/dashboard/analytics?member=${assignment.member_id}`}
                            title="View Analytics"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(!memberAssignments || memberAssignments.length === 0) && (
                <div className="text-center py-8 sm:py-12">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    No members assigned yet
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
                    Start building your client base by assigning workout plans
                    to members
                  </p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/members/assign">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign First Member
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {memberAssignments?.filter((a) => a.status === "active")
                  .length || 0}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Currently training
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {memberAssignments?.filter((a) => {
                  const assignedDate = new Date(a.assigned_at);
                  const now = new Date();
                  return (
                    assignedDate.getMonth() === now.getMonth() &&
                    assignedDate.getFullYear() === now.getFullYear()
                  );
                }).length || 0}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                New assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">87%</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Average workout completion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
