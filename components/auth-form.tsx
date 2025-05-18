"use client";

import { useState, useEffect } from "react";
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

type AuthFormProps = React.ComponentPropsWithoutRef<"div"> & {
  defaultMode?: "login" | "signup";
};

export function AuthForm({
  className,
  defaultMode = "login",
  ...props
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);

  // Update the URL when mode changes
  useEffect(() => {
    const url = mode === "signup" ? "/auth?mode=signup" : "/auth";
    window.history.replaceState(null, "", url);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would typically handle authentication
    // For now, we'll just log the action
    console.log(`Form submitted in ${mode} mode`);

    // And redirect to home (you would do this after successful auth)
    // router.push("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
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
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1234567890" />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" required />
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
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  {submitButtonText}
                </Button>
              </div>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="underline underline-offset-4 hover:text-primary"
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
