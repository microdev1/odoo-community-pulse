"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { loginUser, registerUser, AuthResponse } from "@/lib/mock-db";
import { useAuth } from "@/lib/auth-context";

type AuthFormProps = React.ComponentPropsWithoutRef<"div"> & {
  defaultMode?: "login" | "signup";
};

export function AuthForm({
  className,
  defaultMode = "login",
  ...props
}: AuthFormProps) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update the URL when mode changes
  useEffect(() => {
    const url = mode === "signup" ? "/auth?mode=signup" : "/auth";
    window.history.replaceState(null, "", url);
    // Clear form state when mode changes
    setError(null);
    setSuccess(null);
  }, [mode]);

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create an account";
  const description = isLogin
    ? "Login to your account"
    : "Sign up to get started";
  const submitButtonText = isLogin ? "Login" : "Sign up";
  const toggleText = isLogin
    ? "Don't have an account? Sign up"
    : "Already have an account? Log in";

  const handleToggleMode = () => {
    setMode(isLogin ? "signup" : "login");
    setFormData({
      username: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response: AuthResponse;

      if (isLogin) {
        response = await loginUser(formData.username, formData.password);
      } else {
        response = await registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
      }

      if (response.success) {
        setSuccess(response.message);
        console.log("Auth successful:", response);

        // Store token in localStorage for future API calls
        if (response.token) {
          localStorage.setItem("authToken", response.token);

          try {
            // Refresh auth state to reflect the new user login
            await refreshAuth();

            // Redirect to appropriate page after a brief delay to show success message
            setTimeout(() => {
              const redirectUrl = response.user?.isAdmin
                ? "/admin"
                : "/my-events";
              console.log("Redirecting to", redirectUrl);

              // Force a client-side navigation with replacing current history entry
              router.replace(redirectUrl);

              // For complex redirects or if issues persist, we can also refresh the page
              // window.location.href = redirectUrl;
            }, 1500);
          } catch (err) {
            console.error("Error refreshing auth state:", err);
            setError(
              "Authentication successful, but failed to update session. Please try again."
            );
          }
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-500">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                {!isLogin && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : submitButtonText}
                </Button>
              </div>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="underline underline-offset-4 hover:text-primary"
                  disabled={isLoading}
                >
                  {toggleText}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
