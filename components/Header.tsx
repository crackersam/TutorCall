"use client";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <div className="w-full border-b border-black dark:border-white bg-white dark:bg-black flex justify-between p-4">
      <div className="flex gap-2 items-center">
        <div className="inline">Logo</div>
        <Link href="/">Dashboard</Link>
      </div>
      <div className="flex gap-2 items-center">
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="rounded-full border border-black dark:border-white"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </div>
  );
};

export default Header;
