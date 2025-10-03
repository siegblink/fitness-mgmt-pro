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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Utensils,
  Search,
  Plus,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Copy,
  Eye,
  UserPlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default async function MealPlansPage() {
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

  // Get meal plans with assignment counts
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      meal_plan_assignments(count)
    `,
    )
    .eq("trainer_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meal Plans</h1>
            <p className="text-muted-foreground">
              Create and manage nutrition programs for your members
            </p>
          </div>
          <Button asChild className="md:mt-1">
            <Link href="/dashboard/meal-plans/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search meal plans..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mealPlans?.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {plan.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/meal-plans/${plan.id}`}>
                          <Eye className="h-4 w-4" />
                          View Plan
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/meal-plans/${plan.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          Edit Plan
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4" />
                        Duplicate Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4" />
                        Assign to Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {plan.duration_days} days
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {plan.meal_plan_assignments?.[0]?.count || 0} assigned
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.dietary_type && (
                    <div className="flex items-center">
                      <Badge variant="secondary">{plan.dietary_type}</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.goals?.map((goal: string) => (
                      <Badge key={goal} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/dashboard/meal-plans/${plan.id}`}>
                      View Plan
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/meal-plans/${plan.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!mealPlans || mealPlans.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No meal plans yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first meal plan to start managing nutrition for your
                members
              </p>
              <Button asChild>
                <Link href="/dashboard/meal-plans/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mealPlans?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mealPlans?.reduce(
                  (sum, plan) =>
                    sum + (plan.meal_plan_assignments?.[0]?.count || 0),
                  0,
                ) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                High Protein Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mealPlans?.filter((p) => p.dietary_type === "high-protein")
                  .length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Weight Loss Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mealPlans?.filter((p) => p.goals?.includes("weight-loss"))
                  .length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
