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
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Mail,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

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

  // Get assigned members
  const { data: memberAssignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      member:profiles!member_assignments_member_id_fkey(id, full_name, email, created_at),
      workout_plan:workout_plans(name, difficulty_level)
    `,
    )
    .eq("trainer_id", data.user.id)
    .order("assigned_at", { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground">
              Manage your assigned members and their progress
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/members/assign">
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Member
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search members..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Members ({memberAssignments?.length || 0})
            </CardTitle>
            <CardDescription>
              Track and manage your assigned members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberAssignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {assignment.member?.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {assignment.member?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.member?.email}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined{" "}
                        {new Date(
                          assignment.member?.created_at || "",
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {assignment.workout_plan?.name}
                      </p>
                      <div className="flex items-center gap-2">
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
                        <Badge variant="outline" className="text-xs">
                          {assignment.workout_plan?.difficulty_level}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/messages?member=${assignment.member_id}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/analytics?member=${assignment.member_id}`}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!memberAssignments || memberAssignments.length === 0) && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No members assigned yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your client base by assigning workout plans
                    to members
                  </p>
                  <Button asChild>
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberAssignments?.filter((a) => a.status === "active")
                  .length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently training
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberAssignments?.filter((a) => {
                  const assignedDate = new Date(a.assigned_at);
                  const now = new Date();
                  return (
                    assignedDate.getMonth() === now.getMonth() &&
                    assignedDate.getFullYear() === now.getFullYear()
                  );
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">New assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Average workout completion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
