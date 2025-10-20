import {
  Bell,
  Briefcase,
  Clock,
  Eye,
  Key,
  Save,
  Shield,
  User,
} from "lucide-react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  <a
                    href="#profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <a
                    href="#notifications"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </a>
                  <a
                    href="#business"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Briefcase className="h-4 w-4" />
                    Business Info
                  </a>
                  <a
                    href="#availability"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    Availability
                  </a>
                  <a
                    href="#privacy"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Privacy
                  </a>
                  <a
                    href="#security"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card id="profile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      defaultValue={profile?.full_name || ""}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={profile?.email || ""}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={profile?.phone || ""}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      defaultValue={profile?.date_of_birth || ""}
                    />
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card id="notifications">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Member Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new members are assigned to you
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Workout Completions</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when members complete workouts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card id="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Manage your professional credentials and specialties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">
                        Strength Training
                      </SelectItem>
                      <SelectItem value="cardio">Cardiovascular</SelectItem>
                      <SelectItem value="flexibility">
                        Flexibility & Mobility
                      </SelectItem>
                      <SelectItem value="sports">Sports Performance</SelectItem>
                      <SelectItem value="rehabilitation">
                        Rehabilitation
                      </SelectItem>
                      <SelectItem value="nutrition">
                        Nutrition Coaching
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List your certifications (e.g., NASM, ACE, ACSM)"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write a brief description about your training philosophy and approach"
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Information
                </Button>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card id="availability">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability Settings
                </CardTitle>
                <CardDescription>
                  Set your working hours and available days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input id="start_time" type="time" defaultValue="06:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input id="end_time" type="time" defaultValue="20:00" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base">Available Days</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch
                          id={day.toLowerCase()}
                          defaultChecked={!["Saturday", "Sunday"].includes(day)}
                        />
                        <Label htmlFor={day.toLowerCase()}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Availability
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card id="privacy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your information is shared and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to see your full profile
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Contact Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Show your contact details to assigned members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you&apos;re online and available
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card id="security">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start lg:items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Password</Label>
                      <p className="text-sm text-muted-foreground">
                        Last updated: March 15, 2024
                      </p>
                    </div>
                    <Button variant="outline">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-start lg:items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  <Separator />
                  <div className="flex items-start lg:items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Active Sessions</Label>
                      <p className="text-sm text-muted-foreground">
                        Manage devices that are signed into your account
                      </p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
