"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Dumbbell, Target, BarChart3 } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MemberProgress {
  member_name: string;
  total_workouts: number;
  total_sets: number;
  avg_weight: number;
  last_workout: string;
}

export default function TrainerAnalyticsPage() {
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([]);
  const [timeRange, setTimeRange] = useState<string>("30");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalWorkouts: 0,
    avgCompletionRate: 0,
  });
  const [chartData, setChartData] = useState<
    { date: string; workouts: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get member assignments
        const { data: assignments } = await supabase
          .from("member_assignments")
          .select(
            `
            *,
            member:profiles!member_assignments_member_id_fkey(full_name),
            workout_plan:workout_plans(name)
          `,
          )
          .eq("trainer_id", user.id);

        // Get progress data for all assigned members
        const memberIds = assignments?.map((a) => a.member_id) || [];
        if (memberIds.length > 0) {
          const { data: progress } = await supabase
            .from("progress_entries")
            .select(
              `
              *,
              workout_session:workout_sessions(
                workout_plan:workout_plans(trainer_id)
              )
            `,
            )
            .in("member_id", memberIds)
            .gte(
              "completed_at",
              new Date(
                Date.now() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000,
              ).toISOString(),
            );

          // Filter progress for this trainer's plans only
          const trainerProgress =
            progress?.filter(
              (p) => p.workout_session?.workout_plan?.trainer_id === user.id,
            ) || [];

          // Calculate member progress
          const memberProgressMap = new Map<string, MemberProgress>();

          trainerProgress.forEach((entry) => {
            const memberName =
              assignments?.find((a) => a.member_id === entry.member_id)?.member
                ?.full_name || "Unknown";

            if (!memberProgressMap.has(entry.member_id)) {
              memberProgressMap.set(entry.member_id, {
                member_name: memberName,
                total_workouts: 0,
                total_sets: 0,
                avg_weight: 0,
                last_workout: entry.completed_at,
              });
            }

            const memberData = memberProgressMap.get(entry.member_id)!;
            memberData.total_sets += entry.sets_completed || 0;
            memberData.total_workouts += 1;

            if (entry.weight_used_kg) {
              memberData.avg_weight =
                (memberData.avg_weight + entry.weight_used_kg) / 2;
            }

            if (
              new Date(entry.completed_at) > new Date(memberData.last_workout)
            ) {
              memberData.last_workout = entry.completed_at;
            }
          });

          setMemberProgress(Array.from(memberProgressMap.values()));

          // Calculate stats
          const totalMembers = assignments?.length || 0;
          const activeMembers = memberProgressMap.size;
          const totalWorkouts = trainerProgress.length;
          const avgCompletionRate =
            totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

          setStats({
            totalMembers,
            activeMembers,
            totalWorkouts,
            avgCompletionRate: Math.round(avgCompletionRate),
          });

          // Prepare chart data - workouts per day
          const workoutsByDate = trainerProgress.reduce(
            (acc: { [key: string]: number }, entry) => {
              const date = new Date(entry.completed_at).toLocaleDateString();
              acc[date] = (acc[date] || 0) + 1;
              return acc;
            },
            {},
          );

          const chartData = Object.entries(workoutsByDate).map(
            ([date, count]) => ({
              date,
              workouts: count,
            }),
          );

          setChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [supabase, timeRange]);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your members&apos; progress and engagement
            </p>
          </div>
          <div className="flex items-center gap-4 md:mt-1">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to your plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                Working out regularly
              </p>
            </CardContent>
          </Card>

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
                In selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgCompletionRate}%
              </div>
              <p className="text-xs text-muted-foreground">Member activity</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Workout Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workout Activity
              </CardTitle>
              <CardDescription>
                Daily workout completions by your members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No workout activity yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Chart will appear once members start completing workouts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Member Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Member Engagement
              </CardTitle>
              <CardDescription>Active vs inactive members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: stats.activeMembers },
                        {
                          name: "Inactive",
                          value: stats.totalMembers - stats.activeMembers,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Active", value: stats.activeMembers },
                        {
                          name: "Inactive",
                          value: stats.totalMembers - stats.activeMembers,
                        },
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Progress Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Member Progress Overview
            </CardTitle>
            <CardDescription>
              Individual member performance and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memberProgress.length > 0 ? (
              <div className="space-y-4">
                {memberProgress.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.member_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{member.member_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last workout:{" "}
                          {new Date(member.last_workout).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">
                          {member.total_workouts}
                        </div>
                        <div className="text-muted-foreground">Workouts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{member.total_sets}</div>
                        <div className="text-muted-foreground">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {Math.round(member.avg_weight)}kg
                        </div>
                        <div className="text-muted-foreground">Avg Weight</div>
                      </div>
                      <Badge
                        variant={
                          member.total_workouts > 5 ? "default" : "secondary"
                        }
                      >
                        {member.total_workouts > 5
                          ? "Active"
                          : "Getting Started"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No member activity yet
                </h3>
                <p className="text-muted-foreground">
                  Your members haven&apos;t started logging workouts yet.
                  Encourage them to begin their fitness journey!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
