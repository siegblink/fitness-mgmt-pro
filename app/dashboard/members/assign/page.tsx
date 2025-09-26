"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UserPlus, Search } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface Trainer {
  id: string;
  full_name: string;
  email: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  difficulty_level: string;
  duration_weeks: number;
}

export default function AssignMemberPage() {
  const [formData, setFormData] = useState({
    member_id: "",
    trainer_id: "",
    workout_plan_id: "",
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        setCurrentUserId(user.id);

        // Check if user is trainer
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "trainer") {
          router.push("/member-dashboard");
          return;
        }

        // Set current user as default trainer selection
        setFormData((prev) => ({
          ...prev,
          trainer_id: user.id,
        }));

        // Fetch all members that are not already assigned to the current trainer
        const { data: assignedMemberIds } = await supabase
          .from("member_assignments")
          .select("member_id")
          .eq("trainer_id", user.id)
          .eq("status", "active");

        const assignedIds = assignedMemberIds?.map((a) => a.member_id) || [];

        // Fetch all members with role 'member'
        let membersQuery = supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .eq("role", "member");

        // Only filter out assigned members if there are any
        if (assignedIds.length > 0) {
          membersQuery = membersQuery.not("id", "in", assignedIds);
        }

        const { data: allMembers, error: membersError } = await membersQuery;

        if (membersError) {
          console.error("Error fetching members:", membersError);
        }

        setMembers(allMembers || []);
        setFilteredMembers(allMembers || []);

        // Fetch all trainers
        const { data: allTrainers } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("role", "trainer");

        setTrainers(allTrainers || []);

        // Fetch workout plans created by the current trainer
        const { data: plans } = await supabase
          .from("workout_plans")
          .select("id, name, difficulty_level, duration_weeks")
          .eq("trainer_id", user.id)
          .order("name");

        setWorkoutPlans(plans || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      }
    };

    fetchData();
  }, [router, supabase]);

  useEffect(() => {
    // Filter members based on search
    if (!memberSearch.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(
        (member) =>
          member.full_name
            ?.toLowerCase()
            .includes(memberSearch.toLowerCase()) ||
          member.email?.toLowerCase().includes(memberSearch.toLowerCase()),
      );
      setFilteredMembers(filtered);
    }
  }, [memberSearch, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if member is already assigned to the selected trainer
      const { data: existingAssignment } = await supabase
        .from("member_assignments")
        .select("id")
        .eq("member_id", formData.member_id)
        .eq("trainer_id", formData.trainer_id)
        .eq("status", "active")
        .single();

      if (existingAssignment) {
        throw new Error(
          "This member is already assigned to the selected trainer.",
        );
      }

      // Create the assignment
      const { error: insertError } = await supabase
        .from("member_assignments")
        .insert({
          member_id: formData.member_id,
          trainer_id: formData.trainer_id,
          workout_plan_id:
            formData.workout_plan_id === "none" || !formData.workout_plan_id
              ? null
              : formData.workout_plan_id,
          status: "active",
          assigned_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      router.push("/dashboard/members");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMember = members.find((m) => m.id === formData.member_id);
  const selectedTrainer = trainers.find((t) => t.id === formData.trainer_id);
  const selectedWorkoutPlan = workoutPlans.find(
    (w) =>
      w.id === formData.workout_plan_id && formData.workout_plan_id !== "none",
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" className="mt-1" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Assign Member
            </h1>
            <p className="text-muted-foreground">
              Assign a member to a trainer with an optional workout plan
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Member</CardTitle>
              <CardDescription>
                Choose a member to assign to a trainer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Member Search */}
              <div className="space-y-2">
                <Label htmlFor="memberSearch">Search Members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="memberSearch"
                    placeholder="Search by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Member Selection */}
              <div className="space-y-2">
                <Label htmlFor="member">Member *</Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, member_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-members" disabled>
                        {memberSearch
                          ? "No members match your search"
                          : "No available members to assign"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedMember && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm font-medium">Selected Member:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.full_name} • {selectedMember.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined{" "}
                    {new Date(selectedMember.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trainer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Trainer</CardTitle>
              <CardDescription>
                Choose the trainer for this member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trainer">Trainer *</Label>
                <Select
                  value={formData.trainer_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, trainer_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.full_name}
                        {trainer.id === currentUserId && " (You)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrainer && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm font-medium">Selected Trainer:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrainer.full_name} • {selectedTrainer.email}
                    {selectedTrainer.id === currentUserId && " (You)"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Plan (Optional)</CardTitle>
              <CardDescription>
                Optionally assign a workout plan to this member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workoutPlan">Workout Plan</Label>
                <Select
                  value={formData.workout_plan_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, workout_plan_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workout plan (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (assign later)</SelectItem>
                    {workoutPlans.length > 0 ? (
                      workoutPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-plans" disabled>
                        No workout plans available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedWorkoutPlan && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm font-medium">Selected Workout Plan:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkoutPlan.name} •{" "}
                    {selectedWorkoutPlan.difficulty_level} •{" "}
                    {selectedWorkoutPlan.duration_weeks} weeks
                  </p>
                </div>
              )}

              {workoutPlans.length === 0 && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    No workout plans available. You can{" "}
                    <Link href="/dashboard/workouts/new" className="underline">
                      create a workout plan
                    </Link>{" "}
                    first, or assign one later from the member management page.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={
                isLoading || !formData.member_id || !formData.trainer_id
              }
            >
              {isLoading ? (
                "Assigning..."
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Member
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/members">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
