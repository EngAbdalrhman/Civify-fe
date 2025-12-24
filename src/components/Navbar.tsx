"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { usePermissions } from "@/contexts/PermissionContext";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";

const navigationItems = [
  {
    name: "Products",
    hasDropdown: true,
    items: [
      { name: "Free Plan", href: "/plans" },
      { name: "Pro Plan", href: "/plans" },
      { name: "Enterprise", href: "/plans" },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { groupName, clearPermissions } = usePermissions();
  const { resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status on mount and when window focuses
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Re-check on window focus (in case user logged in/out in another tab)
    window.addEventListener("focus", checkAuth);
    // Also check on storage change event
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    clearPermissions();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Determine logo based on theme
  const logoSrc = mounted && resolvedTheme === 'dark' 
    ? '/civfiy-logo-dark.png' 
    : '/civify-logo-2.png';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <Image
                src={logoSrc}
                alt="Civify Logo"
                width={150}
                height={32}
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) =>
              item.hasDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm font-medium"
                    >
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          href={subItem.href}
                          className="cursor-pointer w-full"
                        >
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button key={item.name} variant="ghost" asChild>
                  <Link href={item.href!} className="text-sm font-medium">
                    {item.name}
                  </Link>
                </Button>
              )
            )}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              /* User is logged in - show user menu */
              <>
                <Button variant="outline" asChild>
                  <Link href="/app">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {groupName || "User"}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/app" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/app/settings" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* User is not logged in - show sign in / sign up */
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  <Link href="/signup">Start for free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Navigation Links */}
                {navigationItems.map((item) => (
                  <div key={item.name} className="space-y-2">
                    {item.hasDropdown ? (
                      <>
                        <h3 className="font-semibold text-sm text-muted-foreground px-2">
                          {item.name}
                        </h3>
                        <div className="space-y-1 pl-2">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href!}
                        className="block px-2 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/app" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          Start for free
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
