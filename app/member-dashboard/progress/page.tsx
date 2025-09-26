"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MemberDashboardLayout from "@/components/member-dashboard-layout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Calendar,
  Dumbbell,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ProgressData {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  exercise: string;
}

export default function MemberProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [exercises, setExercises] = useState<{ name: string }[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalSets: 0,
    averageWeight: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get progress entries with exercise and session details
        const { data: progress } = await supabase
          .from("progress_entries")
          .select(
            `
            *,
            exercise:exercises(name, muscle_groups),
            workout_session:workout_sessions(
              name,
              workout_plan:workout_plans(name)
            )
          `,
          )
          .eq("member_id", user.id)
          .order("completed_at", { ascending: true });

        if (progress) {
          // Transform data for charts
          const chartData = progress.map((entry) => ({
            date: new Date(entry.completed_at).toLocaleDateString(),
            weight: entry.weight_used_kg || 0,
            reps: Number.parseInt(entry.reps_completed) || 0,
            exercise: entry.exercise?.name || "Unknown",
            sets: entry.sets_completed || 0,
          }));

          setProgressData(chartData);

          // Get unique exercises
          const uniqueExercises = Array.from(
            new Set(progress.map((p) => p.exercise?.name).filter(Boolean)),
          );
          setExercises(uniqueExercises.map((name) => ({ name })));

          // Calculate stats
          const totalWorkouts = new Set(
            progress.map((p) => p.workout_session_id),
          ).size;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const thisWeekWorkouts = progress.filter(
            (p) => new Date(p.completed_at) >= weekAgo,
          ).length;

          const totalSets = progress.reduce(
            (sum, p) => sum + (p.sets_completed || 0),
            0,
          );
          const weightsUsed = progress
            .filter((p) => p.weight_used_kg)
            .map((p) => p.weight_used_kg);
          const averageWeight =
            weightsUsed.length > 0
              ? weightsUsed.reduce((a, b) => a + b, 0) / weightsUsed.length
              : 0;

          setStats({
            totalWorkouts,
            thisWeekWorkouts,
            totalSets,
            averageWeight: Math.round(averageWeight * 10) / 10,
          });
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [supabase]);

  // Filter data based on selections
  const filteredData = progressData.filter((item) => {
    if (selectedExercise !== "all" && item.exercise !== selectedExercise)
      return false;
    return true;
  });

  // Group data by exercise for weight progression
  const exerciseProgressData = exercises.map((exercise) => {
    const exerciseData = filteredData.filter(
      (item) => item.exercise === exercise.name,
    );
    const avgWeight =
      exerciseData.length > 0
        ? exerciseData.reduce((sum, item) => sum + item.weight, 0) /
          exerciseData.length
        : 0;
    const totalSets = exerciseData.reduce((sum, item) => sum + item.sets, 0);

    return {
      exercise: exercise.name,
      avgWeight: Math.round(avgWeight * 10) / 10,
      totalSets,
      sessions: exerciseData.length,
    };
  });

  if (isLoading) {
    return (
      <MemberDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </MemberDashboardLayout>
    );
  }

  return (
    <MemberDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Progress Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor your fitness journey and celebrate your achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                Sessions completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekWorkouts}</div>
              <p className="text-xs text-muted-foreground">Exercises logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSets}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageWeight}kg</div>
              <p className="text-xs text-muted-foreground">
                Across all exercises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exercise</label>
                <Select
                  value={selectedExercise}
                  onValueChange={setSelectedExercise}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exercises</SelectItem>
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise.name} value={exercise.name}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {progressData.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weight Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weight Progression
                </CardTitle>
                <CardDescription>
                  Track your strength gains over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Exercise Performance
                </CardTitle>
                <CardDescription>Average weight by exercise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exerciseProgressData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="exercise"
                        className="text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Bar dataKey="avgWeight" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No progress data yet</h3>
              <p className="text-muted-foreground mb-6">
                Start logging your workouts to see your progress and track your
                fitness journey
              </p>
              <Button asChild>
                <Link href="/member-dashboard/workouts">
                  Start Your First Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Celebrate your fitness milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">First Workout Completed!</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve started your fitness journey
                  </p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>

              {stats.totalWorkouts >= 5 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Consistency Champion</p>
                    <p className="text-sm text-muted-foreground">
                      Completed 5 workouts
                    </p>
                  </div>
                  <Badge variant="secondary">Earned</Badge>
                </div>
              )}

              {stats.totalSets >= 50 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Set Master</p>
                    <p className="text-sm text-muted-foreground">
                      Completed 50 sets
                    </p>
                  </div>
                  <Badge variant="secondary">Earned</Badge>
                </div>
              )}

              {stats.totalWorkouts === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    Complete your first workout to start earning achievements!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberDashboardLayout>
  );
}
