"use client";

import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
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
  "Muscle Gain",
  "Maintenance",
  "Energy Boost",
  "Athletic Performance",
  "Healthy Eating",
  "Recovery",
];

const DIETARY_TYPES = [
  { value: "balanced", label: "Balanced" },
  { value: "low-carb", label: "Low Carb" },
  { value: "high-protein", label: "High Protein" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

interface MealItem {
  id: string;
  day_number: number;
  meal_type: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  calories: string;
  protein_grams: string;
  carbs_grams: string;
  fats_grams: string;
  order_index: number;
}

export default function NewMealPlanPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_days: "",
    dietary_type: "",
    goals: [] as string[],
  });
  const [customGoal, setCustomGoal] = useState("");
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [currentMeal, setCurrentMeal] = useState<Partial<MealItem>>({
    day_number: 1,
    meal_type: "breakfast",
    name: "",
    description: "",
    ingredients: [],
    instructions: "",
    calories: "",
    protein_grams: "",
    carbs_grams: "",
    fats_grams: "",
  });
  const [currentIngredient, setCurrentIngredient] = useState("");
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

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setCurrentMeal((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), currentIngredient.trim()],
      }));
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setCurrentMeal((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddMeal = () => {
    if (!currentMeal.name || !currentMeal.meal_type) {
      setError("Please provide at least meal name and type");
      return;
    }

    const newMeal: MealItem = {
      id: `temp-${Date.now()}`,
      day_number: currentMeal.day_number || 1,
      meal_type: currentMeal.meal_type || "breakfast",
      name: currentMeal.name || "",
      description: currentMeal.description || "",
      ingredients: currentMeal.ingredients || [],
      instructions: currentMeal.instructions || "",
      calories: currentMeal.calories || "",
      protein_grams: currentMeal.protein_grams || "",
      carbs_grams: currentMeal.carbs_grams || "",
      fats_grams: currentMeal.fats_grams || "",
      order_index: mealItems.length,
    };

    setMealItems((prev) => [...prev, newMeal]);
    setCurrentMeal({
      day_number: currentMeal.day_number || 1,
      meal_type: "breakfast",
      name: "",
      description: "",
      ingredients: [],
      instructions: "",
      calories: "",
      protein_grams: "",
      carbs_grams: "",
      fats_grams: "",
    });
    setError(null);
  };

  const handleRemoveMeal = (id: string) => {
    setMealItems((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create meal plan
      const { data: mealPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          name: formData.name,
          description: formData.description,
          trainer_id: user.id,
          duration_days: Number.parseInt(formData.duration_days, 10),
          dietary_type: formData.dietary_type,
          goals: formData.goals,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create meal items if any
      if (mealItems.length > 0) {
        const mealItemsToInsert = mealItems.map((meal) => ({
          meal_plan_id: mealPlan.id,
          day_number: meal.day_number,
          meal_type: meal.meal_type,
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          calories: meal.calories ? Number.parseInt(meal.calories, 10) : null,
          protein_grams: meal.protein_grams
            ? Number.parseFloat(meal.protein_grams)
            : null,
          carbs_grams: meal.carbs_grams
            ? Number.parseFloat(meal.carbs_grams)
            : null,
          fats_grams: meal.fats_grams
            ? Number.parseFloat(meal.fats_grams)
            : null,
          order_index: meal.order_index,
        }));

        const { error: itemsError } = await supabase
          .from("meal_items")
          .insert(mealItemsToInsert);

        if (itemsError) throw itemsError;
      }

      router.push(`/dashboard/meal-plans/${mealPlan.id}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/meal-plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create Meal Plan
            </h1>
            <p className="text-muted-foreground">
              Design a new nutrition program for your members
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the foundation of your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., High Protein Weight Loss Plan"
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
                  placeholder="Describe the meal plan, its focus, and what members can expect..."
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
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="7"
                    value={formData.duration_days}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration_days: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary">Dietary Type *</Label>
                  <Select
                    value={formData.dietary_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        dietary_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIETARY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
              <CardDescription>
                Select the primary goals this meal plan addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_GOALS.map((goal) => (
                  <Button
                    key={goal}
                    type="button"
                    variant={
                      formData.goals.includes(goal) ? "default" : "outline"
                    }
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

          {/* Add Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Add Meals</CardTitle>
              <CardDescription>
                Create individual meals for each day (optional - can be added
                later)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_number">Day Number</Label>
                  <Input
                    id="day_number"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={currentMeal.day_number || ""}
                    onChange={(e) =>
                      setCurrentMeal((prev) => ({
                        ...prev,
                        day_number: Number.parseInt(e.target.value, 10),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select
                    value={currentMeal.meal_type}
                    onValueChange={(value) =>
                      setCurrentMeal((prev) => ({ ...prev, meal_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_name">Meal Name</Label>
                <Input
                  id="meal_name"
                  placeholder="e.g., Protein Pancakes"
                  value={currentMeal.name || ""}
                  onChange={(e) =>
                    setCurrentMeal((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_description">Description</Label>
                <Textarea
                  id="meal_description"
                  placeholder="Brief description of the meal..."
                  value={currentMeal.description || ""}
                  onChange={(e) =>
                    setCurrentMeal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Ingredients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ingredient..."
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddIngredient}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {currentMeal.ingredients &&
                  currentMeal.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentMeal.ingredients.map((ingredient) => (
                        <Badge
                          key={ingredient}
                          variant="secondary"
                          className="gap-1"
                        >
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Cooking or preparation instructions..."
                  value={currentMeal.instructions || ""}
                  onChange={(e) =>
                    setCurrentMeal((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="500"
                    value={currentMeal.calories || ""}
                    onChange={(e) =>
                      setCurrentMeal((prev) => ({
                        ...prev,
                        calories: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={currentMeal.protein_grams || ""}
                    onChange={(e) =>
                      setCurrentMeal((prev) => ({
                        ...prev,
                        protein_grams: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="40"
                    value={currentMeal.carbs_grams || ""}
                    onChange={(e) =>
                      setCurrentMeal((prev) => ({
                        ...prev,
                        carbs_grams: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={currentMeal.fats_grams || ""}
                    onChange={(e) =>
                      setCurrentMeal((prev) => ({
                        ...prev,
                        fats_grams: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddMeal}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal to Plan
              </Button>

              {/* Display added meals */}
              {mealItems.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Added Meals ({mealItems.length}):</Label>
                  <div className="space-y-2">
                    {mealItems.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Day {meal.day_number}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {meal.meal_type}
                            </Badge>
                            <span className="font-medium">{meal.name}</span>
                          </div>
                          {meal.calories && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {meal.calories} cal
                              {meal.protein_grams &&
                                ` • ${meal.protein_grams}g protein`}
                              {meal.carbs_grams &&
                                ` • ${meal.carbs_grams}g carbs`}
                              {meal.fats_grams && ` • ${meal.fats_grams}g fats`}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMeal(meal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
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
              {isLoading ? "Creating..." : "Create Meal Plan"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/meal-plans">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
