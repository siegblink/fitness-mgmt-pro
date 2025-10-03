"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

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

export default function EditMealPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        // Get meal plan
        const { data: mealPlan, error: planError } = await supabase
          .from("meal_plans")
          .select("*")
          .eq("id", id)
          .single();

        if (planError) throw planError;

        setFormData({
          name: mealPlan.name,
          description: mealPlan.description || "",
          duration_days: mealPlan.duration_days?.toString() || "",
          dietary_type: mealPlan.dietary_type || "",
          goals: mealPlan.goals || [],
        });

        // Get meal items
        const { data: items, error: itemsError } = await supabase
          .from("meal_items")
          .select("*")
          .eq("meal_plan_id", id)
          .order("day_number", { ascending: true })
          .order("order_index", { ascending: true });

        if (itemsError) throw itemsError;

        if (items) {
          setMealItems(
            items.map((item) => ({
              id: item.id,
              day_number: item.day_number,
              meal_type: item.meal_type,
              name: item.name,
              description: item.description || "",
              ingredients: item.ingredients || [],
              instructions: item.instructions || "",
              calories: item.calories?.toString() || "",
              protein_grams: item.protein_grams?.toString() || "",
              carbs_grams: item.carbs_grams?.toString() || "",
              fats_grams: item.fats_grams?.toString() || "",
              order_index: item.order_index,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching meal plan:", error);
        setError("Failed to load meal plan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlan();
  }, [id, supabase]);

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

  const handleRemoveMeal = async (id: string) => {
    // If it's an existing meal (not temp), delete from database
    if (!id.startsWith("temp-")) {
      try {
        const { error } = await supabase
          .from("meal_items")
          .delete()
          .eq("id", id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting meal:", error);
        setError("Failed to delete meal");
        return;
      }
    }

    setMealItems((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Update meal plan
      const { error: planError } = await supabase
        .from("meal_plans")
        .update({
          name: formData.name,
          description: formData.description,
          duration_days: Number.parseInt(formData.duration_days),
          dietary_type: formData.dietary_type,
          goals: formData.goals,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (planError) throw planError;

      // Insert new meal items (those with temp- ids)
      const newMeals = mealItems.filter((meal) => meal.id.startsWith("temp-"));
      if (newMeals.length > 0) {
        const mealItemsToInsert = newMeals.map((meal) => ({
          meal_plan_id: id,
          day_number: meal.day_number,
          meal_type: meal.meal_type,
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          calories: meal.calories ? Number.parseInt(meal.calories) : null,
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

      router.push(`/dashboard/meal-plans/${id}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/meal-plans/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Meal Plan
            </h1>
            <p className="text-muted-foreground">
              Update your nutrition program
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the foundation of your meal plan
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
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomGoal())
                  }
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

          {/* Add/Edit Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Meals</CardTitle>
              <CardDescription>
                Add new meals or remove existing ones
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
                        day_number: Number.parseInt(e.target.value),
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
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddIngredient())
                    }
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
                      {currentMeal.ingredients.map((ingredient, index) => (
                        <Badge
                          key={index}
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

              {/* Display meals */}
              {mealItems.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Meals in Plan ({mealItems.length}):</Label>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/meal-plans/${id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
