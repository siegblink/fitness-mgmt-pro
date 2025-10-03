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
  ArrowLeft,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function MealPlanDetailPage({
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

  if (profile?.role !== "trainer") {
    redirect("/member-dashboard");
  }

  // Get meal plan details
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", data.user.id)
    .single();

  // Get member assignments separately to avoid complex join issues
  const { data: memberAssignments } = await supabase
    .from("meal_plan_assignments")
    .select(
      `
      *,
      member:profiles!meal_plan_assignments_member_id_fkey(full_name, email)
    `,
    )
    .eq("meal_plan_id", id);

  if (mealPlanError) {
    console.error("Meal plan query error:", mealPlanError);
    redirect("/dashboard/meal-plans");
  }

  if (!mealPlan) {
    redirect("/dashboard/meal-plans");
  }

  // Get meal items
  const { data: mealItems } = await supabase
    .from("meal_items")
    .select("*")
    .eq("meal_plan_id", id)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });

  // Group meals by day
  const mealsByDay = mealItems?.reduce(
    (acc, meal) => {
      if (!acc[meal.day_number]) {
        acc[meal.day_number] = [];
      }
      acc[meal.day_number].push(meal);
      return acc;
    },
    {} as Record<number, typeof mealItems>,
  );

  const sortedDays = mealsByDay
    ? Object.keys(mealsByDay)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              asChild
            >
              <Link href="/dashboard/meal-plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {mealPlan.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {mealPlan.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-14">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/dashboard/meal-plans/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete Plan
            </Button>
          </div>
        </div>

        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {mealPlan.duration_days} days
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Assigned Members</p>
                  <p className="text-sm text-muted-foreground">
                    {memberAssignments?.length || 0} members
                  </p>
                </div>
              </div>

              {mealPlan.dietary_type && (
                <div>
                  <p className="text-sm font-medium mb-1">Dietary Type</p>
                  <Badge variant="secondary">{mealPlan.dietary_type}</Badge>
                </div>
              )}
            </div>

            {mealPlan.goals && mealPlan.goals.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {mealPlan.goals.map((goal: string) => (
                    <Badge key={goal} variant="outline">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Members */}
        {memberAssignments && memberAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Members</CardTitle>
              <CardDescription>
                Members currently following this meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberAssignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {assignment.member?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.member?.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "active" ? "default" : "secondary"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meals by Day */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Meal Schedule</h2>
            <Button asChild size="sm">
              <Link href={`/dashboard/meal-plans/${id}/edit`}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Meals
              </Link>
            </Button>
          </div>

          {sortedDays.length > 0 ? (
            sortedDays.map((day) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-lg">Day {day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mealsByDay[day].map((meal: any) => (
                    <div
                      key={meal.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs w-fit"
                            >
                              {meal.meal_type}
                            </Badge>
                            <h3 className="font-semibold text-base leading-tight">
                              {meal.name}
                            </h3>
                          </div>
                          {meal.calories && (
                            <Badge
                              variant="outline"
                              className="w-fit text-sm font-semibold self-start"
                            >
                              {meal.calories} cal
                            </Badge>
                          )}
                        </div>
                        {meal.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {meal.description}
                          </p>
                        )}
                      </div>

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Ingredients:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {meal.ingredients.map(
                              (ingredient: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {ingredient}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {meal.instructions && (
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Instructions:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {meal.instructions}
                          </p>
                        </div>
                      )}

                      {(meal.protein_grams ||
                        meal.carbs_grams ||
                        meal.fats_grams) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {meal.protein_grams && (
                            <div className="flex items-baseline gap-1">
                              <span className="font-medium">Protein:</span>
                              <span className="text-muted-foreground">
                                {meal.protein_grams}g
                              </span>
                            </div>
                          )}
                          {meal.carbs_grams && (
                            <div className="flex items-baseline gap-1">
                              <span className="font-medium">Carbs:</span>
                              <span className="text-muted-foreground">
                                {meal.carbs_grams}g
                              </span>
                            </div>
                          )}
                          {meal.fats_grams && (
                            <div className="flex items-baseline gap-1">
                              <span className="font-medium">Fats:</span>
                              <span className="text-muted-foreground">
                                {meal.fats_grams}g
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No meals added to this plan yet
                </p>
                <Button asChild>
                  <Link href={`/dashboard/meal-plans/${id}/edit`}>
                    Add Meals
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
