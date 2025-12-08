"use client";

import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
  {
    name: "Features",
    hasDropdown: true,
    items: [
      { name: "AI CV Generation", href: "/features/ai-generation" },
      { name: "Templates", href: "/features/templates" },
      { name: "Export Options", href: "/features/export" },
      { name: "Analytics", href: "/features/analytics" },
    ],
  },
  {
    name: "Products",
    hasDropdown: true,
    items: [
      { name: "Free Plan", href: "/plans" },
      { name: "Pro Plan", href: "/plans" },
      { name: "Enterprise", href: "/plans" },
    ],
  },
  {
    name: "Resources",
    hasDropdown: true,
    items: [
      { name: "Blog", href: "/resources/blog" },
      { name: "Documentation", href: "/resources/docs" },
      { name: "Help Center", href: "/resources/help" },
      { name: "Community", href: "/resources/community" },
    ],
  },
  {
    name: "Contact",
    hasDropdown: false,
    href: "/contact",
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold">Civify</span>
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
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
              <Link href="/signup">Start for free</Link>
            </Button>
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
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Start for free
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
