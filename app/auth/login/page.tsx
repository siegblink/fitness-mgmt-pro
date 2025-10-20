"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const supabase = createClient();
    setServerError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setServerError(
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-10 left-10 text-blue-500/20">
        <Activity className="w-20 h-20 animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10 text-purple-500/20">
        <TrendingUp className="w-24 h-24 animate-pulse animation-delay-2000" />
      </div>
      <div className="absolute top-1/3 left-20 text-pink-500/20">
        <Users className="w-16 h-16 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-70" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                    <Dumbbell className="h-10 w-10 text-white" />
                  </div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FitnessPro
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Join thousands of trainers and members achieving their fitness
                goals with our comprehensive platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">10K+</div>
                <div className="text-gray-400">Active Members</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-400">500+</div>
                <div className="text-gray-400">Expert Trainers</div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex flex-col gap-6">
            <div className="lg:hidden text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-70" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FitnessPro
                </span>
              </div>
            </div>

            <Card className="backdrop-blur-lg bg-white/10 dark:bg-gray-900/50 border-gray-700/50 shadow-2xl">
              <CardHeader className="space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    {/* Email Field */}
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel
                        htmlFor="email"
                        className="text-gray-300 text-sm font-medium"
                      >
                        Email Address
                      </FieldLabel>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <Mail className="w-4 h-4 text-gray-400" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="email"
                            type="email"
                            placeholder="trainer@example.com"
                            className="text-white placeholder:text-gray-500"
                            aria-invalid={!!errors.email}
                            {...register("email")}
                          />
                        </InputGroup>
                      </div>
                      <FieldError
                        errors={[errors.email]}
                        className="text-red-400"
                      />
                    </Field>

                    {/* Password Field */}
                    <Field data-invalid={!!errors.password}>
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor="password"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Password
                        </FieldLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          tabIndex={-1}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="text-white placeholder:text-gray-500"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              size="icon-sm"
                              tabIndex={-1}
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-white hover:bg-gray-500/50"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                      <FieldError
                        errors={[errors.password]}
                        className="text-red-400"
                      />
                    </Field>

                    {/* Server Error */}
                    {serverError && (
                      <Alert
                        variant="destructive"
                        className="bg-red-500/10 border-red-500/50"
                      >
                        <AlertDescription className="text-red-400">
                          {serverError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="default"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Spinner className="w-4 h-4" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign In
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    <p className="text-gray-400">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/auth/sign-up"
                        className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Create free account
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
