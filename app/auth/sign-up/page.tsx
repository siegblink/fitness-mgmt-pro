"use client";

import {
  Activity,
  ArrowRight,
  Award,
  Dumbbell,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!role) {
      setError("Please select your role");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-10 left-10 text-purple-500/20">
        <Target className="w-20 h-20 animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10 text-pink-500/20">
        <Award className="w-24 h-24 animate-pulse animation-delay-2000" />
      </div>
      <div className="absolute top-1/3 left-20 text-blue-500/20">
        <Activity className="w-16 h-16 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-70" />
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl">
                    <Dumbbell className="h-10 w-10 text-white" />
                  </div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitnessPro
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Start Your
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transformation
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Join our community of fitness enthusiasts and professionals. Get
                personalized training plans, track progress, and achieve your
                goals.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    Connect with Experts
                  </div>
                  <div className="text-gray-400 text-sm">
                    Access certified trainers and nutritionists
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">Track Progress</div>
                  <div className="text-gray-400 text-sm">
                    Monitor your fitness journey with analytics
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">Achieve Goals</div>
                  <div className="text-gray-400 text-sm">
                    Personalized plans to reach your targets
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Signup form */}
          <div className="flex flex-col gap-6">
            <div className="lg:hidden text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-70" />
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitnessPro
                </span>
              </div>
            </div>

            <Card className="backdrop-blur-lg bg-white/10 dark:bg-gray-900/50 border-gray-700/50 shadow-2xl">
              <CardHeader className="space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Start your fitness journey today
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="text-gray-300 text-sm font-medium"
                      >
                        Full Name
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="relative bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-300 text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="relative bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-gray-300 text-sm font-medium"
                      >
                        I am a...
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="relative bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12 [&>span]:text-gray-500 data-[state=open]:border-purple-500">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem
                              value="trainer"
                              className="text-white hover:bg-gray-800 focus:bg-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-400" />
                                Fitness Trainer
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="member"
                              className="text-white hover:bg-gray-800 focus:bg-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-pink-400" />
                                Gym Member
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Password
                        </Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                          <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="relative bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="repeat-password"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                          <Input
                            id="repeat-password"
                            type="password"
                            required
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            className="relative bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Create Free Account
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-gray-900/50 px-4 text-gray-400">
                        Or
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400">
                      Already have an account?{" "}
                      <Link
                        href="/auth/login"
                        className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
