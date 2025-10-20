"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  Award,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Target,
  TrendingUp,
  User,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

// Zod validation schema
const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    role: z.string().min(1, "Please select your role"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      password: "",
      repeatPassword: "",
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: SignUpFormData) => {
    const supabase = createClient();
    setServerError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setServerError(
        error instanceof Error ? error.message : "An error occurred",
      );
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
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col space-y-8 text-white">
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
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    {/* Full Name Field */}
                    <Field data-invalid={!!errors.fullName}>
                      <FieldLabel
                        htmlFor="fullName"
                        className="text-gray-300 text-sm font-medium"
                      >
                        Full Name
                      </FieldLabel>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <User className="w-4 h-4 text-gray-400" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            className="text-white placeholder:text-gray-500 h-12"
                            aria-invalid={!!errors.fullName}
                            {...register("fullName")}
                          />
                        </InputGroup>
                      </div>
                      <FieldError
                        errors={[errors.fullName]}
                        className="text-red-400"
                      />
                    </Field>

                    {/* Email Field */}
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel
                        htmlFor="email"
                        className="text-gray-300 text-sm font-medium"
                      >
                        Email Address
                      </FieldLabel>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <Mail className="w-4 h-4 text-gray-400" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="text-white placeholder:text-gray-500 h-12"
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

                    {/* Role Field */}
                    <Field data-invalid={!!errors.role}>
                      <FieldLabel
                        htmlFor="role"
                        className="text-gray-300 text-sm font-medium"
                      >
                        I am a...
                      </FieldLabel>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                        <Select
                          value={roleValue}
                          onValueChange={(value) => setValue("role", value)}
                        >
                          <SelectTrigger className="relative bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [&>span]:text-gray-500 data-[state=open]:border-purple-500">
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
                      <FieldError
                        errors={[errors.role]}
                        className="text-red-400"
                      />
                    </Field>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field data-invalid={!!errors.password}>
                        <FieldLabel
                          htmlFor="password"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Password
                        </FieldLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                          <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>
                                <Lock className="w-4 h-4 text-gray-400" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              className="text-white placeholder:text-gray-500 h-12"
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
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
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

                      <Field data-invalid={!!errors.repeatPassword}>
                        <FieldLabel
                          htmlFor="repeatPassword"
                          className="text-gray-300 text-sm font-medium"
                        >
                          Confirm Password
                        </FieldLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                          <InputGroup className="relative bg-gray-800/50 border-gray-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>
                                <Lock className="w-4 h-4 text-gray-400" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="repeatPassword"
                              type={showRepeatPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              className="text-white placeholder:text-gray-500 h-12"
                              aria-invalid={!!errors.repeatPassword}
                              {...register("repeatPassword")}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                size="icon-sm"
                                tabIndex={-1}
                                onClick={() =>
                                  setShowRepeatPassword(!showRepeatPassword)
                                }
                                className="text-gray-400 hover:text-white hover:bg-gray-500/50"
                                aria-label={
                                  showRepeatPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showRepeatPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                        <FieldError
                          errors={[errors.repeatPassword]}
                          className="text-red-400"
                        />
                      </Field>
                    </div>

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
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Spinner className="w-4 h-4" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Create Free Account
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

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
