import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCheck,
} from "lucide-react";
import { redirect } from "next/navigation";
import MemberDashboardLayout from "@/components/member-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function MemberProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "member") {
    redirect("/dashboard");
  }

  // Get member's assignments to find trainer info
  const { data: assignments } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      trainer:profiles!member_assignments_trainer_id_fkey(full_name, email)
    `,
    )
    .eq("member_id", data.user.id)
    .eq("status", "active");

  // Get basic stats
  const { data: progressEntries } = await supabase
    .from("progress_entries")
    .select("id, completed_at")
    .eq("member_id", data.user.id);

  const totalWorkouts = progressEntries?.length || 0;
  const memberSince = new Date(
    profile?.created_at || data.user.created_at,
  ).toLocaleDateString();
  const currentTrainer = assignments?.[0]?.trainer;

  return (
    <MemberDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {profile?.full_name || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {profile?.email || data.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {profile?.phone || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {profile?.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Edit Profile Information
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Account Details
                </CardTitle>
                <CardDescription>
                  Your account status and membership information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Type
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {profile?.role || "Member"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{memberSince}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Workouts
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                      <span className="text-2xl font-bold text-primary">
                        {totalWorkouts}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        sessions completed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Status
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trainer Info */}
            {currentTrainer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Trainer</CardTitle>
                  <CardDescription>
                    Your assigned fitness professional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium">{currentTrainer.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentTrainer.email}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
                <CardDescription>
                  Your fitness journey at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Plans
                  </span>
                  <span className="font-medium">
                    {assignments?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Workouts
                  </span>
                  <span className="font-medium">{totalWorkouts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <span className="font-medium text-xs">{memberSince}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location Settings
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MemberDashboardLayout>
  );
}
