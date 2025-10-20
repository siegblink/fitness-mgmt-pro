"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Dumbbell,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
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
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const supabase = createClient();
    setServerError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setIsSuccess(true);
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
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col space-y-8 text-white">
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
                Reset Your
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Password
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Don&apos;t worry! It happens to the best of us. Enter your email
                address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
          </div>

          {/* Right side - Forgot Password form */}
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
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                >
                  ← Back to Login
                </Link>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white">
                    Forgot Password?
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    {isSuccess
                      ? "Check your email for the reset link"
                      : "Enter your email to receive a password reset link"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="flex flex-col gap-6">
                    <Alert className="bg-green-500/10 border-green-500/50">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <AlertDescription className="text-green-400 ml-2">
                        Password reset email sent! Please check your inbox and
                        follow the instructions to reset your password.
                      </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-4">
                      <Button
                        asChild
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Link href="/auth/login">
                          <span className="flex items-center justify-center gap-2">
                            Return to Login
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </Link>
                      </Button>

                      <button
                        type="button"
                        onClick={() => setIsSuccess(false)}
                        className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Didn&apos;t receive the email? Try again
                      </button>
                    </div>
                  </div>
                ) : (
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
                            Sending reset link...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Send Reset Link
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>

                      <p className="text-gray-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                          href="/auth/sign-up"
                          className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Sign up here
                        </Link>
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
