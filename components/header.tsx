"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Pulse
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden md:block md:flex-1 md:px-6"
        >
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex"
              >
                <Link href="/my-events">My Events</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex"
              >
                <Link href="/registered-events">Registered</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/create-event">Create Event</Link>
              </Button>
              <div className="flex items-center gap-2">
                <Link href="/profile" className="block">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth?mode=signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
      <div className="container mx-auto flex py-2 md:hidden">
        <form onSubmit={handleSearch} className="w-full px-4">
          <Input
            type="search"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
