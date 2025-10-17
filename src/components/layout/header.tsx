"use client";

import Link from "next/link";
import { Film, Home, Tv, Star, User, Clapperboard, History } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Films", icon: Film },
  { href: "/series", label: "Series", icon: Tv },
  { href: "/favorites", label: "Favorieten", icon: Star },
  { href: "/continue-watching", label: "Verder Kijken", icon: History },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto md:mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-xl">CineVerse</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="w-full max-w-xs md:max-w-sm">
            <SearchBar />
          </div>
          <nav>
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
