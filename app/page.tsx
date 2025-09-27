"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Users,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Zap,
  Activity,
  Target,
  Award,
  BarChart3,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: Dumbbell,
      title: "Workout Plans",
      description:
        "Create and customize detailed workout plans with exercise libraries and progression tracking.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: Users,
      title: "Member Management",
      description:
        "Manage your clients with role-based access, assignments, and personalized experiences.",
      color: "green",
      gradient: "from-green-500 to-emerald-400",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor member progress with detailed analytics, charts, and performance insights.",
      color: "purple",
      gradient: "from-purple-500 to-pink-400",
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description:
        "Built-in messaging system for seamless trainer-member communication and support.",
      color: "orange",
      gradient: "from-orange-500 to-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div
          className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-0 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Spotlight effect following mouse */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-full blur-3xl opacity-50 animate-pulse" />
            </div>
            <Dumbbell className="h-20 w-20 text-blue-500 relative z-10 animate-float" />
            <Sparkles className="absolute top-0 right-1/3 h-6 w-6 text-yellow-400 animate-sparkle" />
            <Sparkles
              className="absolute bottom-0 left-1/3 h-4 w-4 text-cyan-400 animate-sparkle"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance relative">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient-x bg-200%">
              FitnessPro
            </span>
            <br />
            <span className="text-white">Management Platform</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto text-pretty leading-relaxed">
            Streamline your fitness business with our comprehensive platform for
            trainers and members. Create workout plans, track progress, and
            build stronger relationships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-blue-500/25 border-0 group"
            >
              <Link href="/auth/login">
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Get Started
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transform hover:scale-105 transition-all duration-200 text-white"
            >
              <Link href="/auth/sign-up">
                Sign Up
                <Activity className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Floating badges */}
          <div className="flex justify-center gap-4 mt-8">
            <div
              className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 text-green-400 text-sm animate-float"
              style={{ animationDelay: "2s" }}
            >
              <Target className="inline h-4 w-4 mr-1" />
              10k+ Active Members
            </div>
            <div
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 text-purple-400 text-sm animate-float"
              style={{ animationDelay: "4s" }}
            >
              <Award className="inline h-4 w-4 mr-1" />
              500+ Trainers
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`relative bg-gray-900/80 border-gray-800 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${
                isHovered === index ? "shadow-2xl border-gray-600" : ""
              }`}
              onMouseEnter={() => setIsHovered(index)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {/* Background gradient effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Decorative corner accent */}
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity duration-300`}
              />

              <CardHeader className="relative z-10 pb-2">
                <div className="relative mb-3">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-150`}
                  />
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <CardDescription className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-based Features */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-blue-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-400 group-hover:animate-pulse" />
                For Trainers
              </CardTitle>
              <CardDescription className="text-gray-400">
                Powerful tools to manage your fitness business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Create and manage workout plans",
                "Assign plans to multiple members",
                "Track member progress and analytics",
                "Communicate with members",
                "Manage exercise library",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-200 group/item"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full group-hover/item:animate-pulse" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
                <Heart className="h-8 w-8 text-green-400 group-hover:animate-pulse" />
                For Members
              </CardTitle>
              <CardDescription className="text-gray-400">
                Everything you need to reach your fitness goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Access personalized workout plans",
                "Log workouts and track progress",
                "View detailed exercise instructions",
                "Message your trainer",
                "Monitor your fitness journey",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors duration-200 group/item"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full group-hover/item:animate-pulse" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Call to action section */}
        <div className="text-center mt-20 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-96 h-32 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur-3xl opacity-20" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of trainers and members already using FitnessPro
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg px-10 py-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-green-500/25 border-0"
          >
            <Link href="/auth/sign-up">
              Start Free Trial
              <Sparkles className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
