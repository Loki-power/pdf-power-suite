"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  
  // Prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
         <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
    >
      <Sun className="h-5 w-5 hidden dark:block text-orange-400" />
      <Moon className="h-5 w-5 block dark:hidden text-slate-700" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
