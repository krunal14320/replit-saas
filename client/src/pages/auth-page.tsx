import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Zap, Lock, Mail, User, UserPlus, LogIn, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { insertUserSchema } from "@shared/schema";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-slate-50">
      {/* Auth Form Column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <Zap className="h-10 w-10 text-blue-500" />
              <span className="ml-2 text-2xl font-bold">SaaS Admin</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? "Sign in to your account" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Enter your credentials to access your dashboard" 
                : "Register for an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm isSubmitting={loginMutation.isPending} onSubmit={loginMutation.mutate} />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm isSubmitting={registerMutation.isPending} onSubmit={registerMutation.mutate} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Hero Column */}
      <div className="hidden sm:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">
            SaaS Admin Boilerplate
          </h1>
          <p className="text-xl mb-8">
            A complete solution for managing your SaaS platform with authentication, RBAC, multi-tenancy, and subscription management.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="bg-white/20 rounded-full p-1.5 mr-3">
                <Lock className="h-5 w-5" />
              </div>
              User authentication and permission management
            </li>
            <li className="flex items-center">
              <div className="bg-white/20 rounded-full p-1.5 mr-3">
                <User className="h-5 w-5" />
              </div>
              Role-based access control (RBAC)
            </li>
            <li className="flex items-center">
              <div className="bg-white/20 rounded-full p-1.5 mr-3">
                <Zap className="h-5 w-5" />
              </div>
              Multi-tenant architecture
            </li>
            <li className="flex items-center">
              <div className="bg-white/20 rounded-full p-1.5 mr-3">
                <Mail className="h-5 w-5" />
              </div>
              Subscription management and billing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (data: { username: string; password: string }) => void }) {
  const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

// Register Form Component
function RegisterForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (data: any) => void }) {
  // Extend the schema with additional validation
  const registerSchema = insertUserSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "user",
      status: "active",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
