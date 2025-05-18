'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { HamburgerMenuIcon, Cross1Icon, CalendarIcon, PlusIcon, PersonIcon, ExitIcon, EnterIcon, HomeIcon, GearIcon } from "@radix-ui/react-icons";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Community Pulse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/" ? "bg-green-800" : "hover:bg-green-700"
              }`}
            >
              <HomeIcon className="mr-1" /> Home
            </Link>
            <Link
              href="/events"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith("/events") ? "bg-green-800" : "hover:bg-green-700"
              }`}
            >
              <CalendarIcon className="mr-1" /> Events
            </Link>
            {session?.user && (
              <Link
                href="/events/create"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/events/create" ? "bg-green-800" : "hover:bg-green-700"
                }`}
              >
                <PlusIcon className="mr-1" /> Create Event
              </Link>
            )}
            {session?.user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/admin") ? "bg-green-800" : "hover:bg-green-700"
                }`}
              >
                <GearIcon className="mr-1" /> Admin
              </Link>
            )}
          </nav>

          {/* User Account Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {session?.user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/account"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith("/account") ? "bg-green-800" : "hover:bg-green-700"
                  }`}
                >
                  <PersonIcon className="mr-1" />
                  {session.user.name}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  <ExitIcon className="mr-1" /> Log out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  <EnterIcon className="mr-1" /> Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center px-3 py-2 rounded-md bg-white text-green-600 hover:bg-gray-100 text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close main menu" : "Open main menu"}
              </span>
              {isMenuOpen ? (
                <Cross1Icon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HamburgerMenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/" ? "bg-green-800" : "hover:bg-green-700"
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith("/events") ? "bg-green-800" : "hover:bg-green-700"
              }`}
              onClick={closeMenu}
            >
              Events
            </Link>
            {session?.user && (
              <Link
                href="/events/create"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/events/create" ? "bg-green-800" : "hover:bg-green-700"
                }`}
                onClick={closeMenu}
              >
                Create Event
              </Link>
            )}
            {session?.user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/admin") ? "bg-green-800" : "hover:bg-green-700"
                }`}
                onClick={closeMenu}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Mobile User Account Menu */}
          <div className="pt-4 pb-3 border-t border-green-700">
            {session?.user ? (
              <div className="px-2 space-y-1">
                <Link
                  href="/account"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith("/account") ? "bg-green-800" : "hover:bg-green-700"
                  }`}
                  onClick={closeMenu}
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                  onClick={closeMenu}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Footer component
export function Footer() {
  return (
    <footer className="bg-green-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold">Community Pulse</h2>
            <p className="mt-2 text-sm text-gray-300">
              Connect with your local community through events and activities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Navigation
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Event Categories
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/events?category=GARAGE_SALE"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Garage Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events?category=SPORTS"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Sports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events?category=COMMUNITY_CLASS"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Community Classes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Community Pulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
