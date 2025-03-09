import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
//import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema"; //These are not used in the replacement code.
import { useToast } from "@/hooks/use-toast";


interface AuthContextType {
  user: any | null; // Replaced SelectUser with any for broader compatibility with the axios changes.
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<any>; // Replaced SelectUser with any
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<any>; // Replaced SelectUser with any
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        return data;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data } = await axios.post("/api/auth/login", credentials);
      return data;
    },
    onSuccess: (data: any) => { // Replaced SelectUser with any
      queryClient.setQueryData(["user"], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.fullName || data.username}!`,
      });
    },
    onError: (error: any) => { // More robust error handling
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
    }) => {
      const { data } = await axios.post("/api/auth/register", userData);
      return data;
    },
    onSuccess: (data: any) => { // Replaced SelectUser with any
      queryClient.setQueryData(["user"], data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.fullName || data.username}!`,
      });
    },
    onError: (error: any) => { // More robust error handling
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      // Force a refresh after logout
      window.location.href = "/auth";
    },
    onError: (error: any) => { // More robust error handling
      toast({
        title: "Logout failed",
        description: error.response?.data?.message || "Could not log out",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}