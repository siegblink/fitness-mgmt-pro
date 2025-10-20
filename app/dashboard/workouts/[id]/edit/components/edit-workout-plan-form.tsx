"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const COMMON_GOALS = [
  "Weight Loss",
  "Muscle Building",
  "Strength Training",
  "Endurance",
  "Flexibility",
  "General Fitness",
  "Athletic Performance",
  "Rehabilitation",
];

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  difficulty_level: string;
  goals: string[] | null;
}

interface EditWorkoutPlanFormProps {
  workoutPlan: WorkoutPlan;
}

export default function EditWorkoutPlanForm({
  workoutPlan,
}: EditWorkoutPlanFormProps) {
  const [formData, setFormData] = useState({
    name: workoutPlan.name,
    description: workoutPlan.description || "",
    duration_weeks: workoutPlan.duration_weeks.toString(),
    difficulty_level: workoutPlan.difficulty_level,
    goals: workoutPlan.goals || [],
  });
  const [customGoal, setCustomGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleAddGoal = (goal: string) => {
    if (!formData.goals.includes(goal)) {
      setFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, goal],
      }));
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g !== goal),
    }));
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !formData.goals.includes(customGoal.trim())) {
      handleAddGoal(customGoal.trim());
      setCustomGoal("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("workout_plans")
        .update({
          name: formData.name,
          description: formData.description,
          duration_weeks: Number.parseInt(formData.duration_weeks, 10),
          difficulty_level: formData.difficulty_level,
          goals: formData.goals,
        })
        .eq("id", workoutPlan.id);

      if (error) throw error;

      router.push(`/dashboard/workouts/${workoutPlan.id}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update the foundation of your workout plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Beginner Full Body Workout"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the workout plan, its focus, and what members can expect..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                placeholder="8"
                value={formData.duration_weeks}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_weeks: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty_level: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Training Goals</CardTitle>
          <CardDescription>
            Update the primary goals this workout plan addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_GOALS.map((goal) => (
              <Button
                key={goal}
                type="button"
                variant={formData.goals.includes(goal) ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  formData.goals.includes(goal)
                    ? handleRemoveGoal(goal)
                    : handleAddGoal(goal)
                }
              >
                {goal}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom goal..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomGoal();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomGoal}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.goals.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Goals:</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {formData.goals.map((goal) => (
                  <Badge key={goal} variant="secondary" className="gap-1">
                    {goal}
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(goal)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Plan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/dashboard/workouts/${workoutPlan.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
