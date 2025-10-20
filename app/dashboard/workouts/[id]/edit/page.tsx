import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import EditWorkoutPlanForm from "./components/edit-workout-plan-form";

export default async function EditWorkoutPlanPage({
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

  // Get the workout plan to edit
  const { data: workoutPlan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", data.user.id)
    .single();

  if (!workoutPlan) {
    redirect("/dashboard/workouts");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/workouts/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Workout Plan
            </h1>
            <p className="text-muted-foreground">
              Update your training program details
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <EditWorkoutPlanForm workoutPlan={workoutPlan} />
      </div>
    </DashboardLayout>
  );
}
