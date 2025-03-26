"use client";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const Header = ({ session }: { session: Session | null }) => {
  const { theme, setTheme } = useTheme();
  const path = usePathname();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <div className="w-full border-b border-black dark:border-white bg-white dark:bg-black flex justify-between p-4">
      <div className="flex gap-2 items-center">
        <div className="inline">Logo</div>
        <Link href="/" className={`link ${path === "/" && "underline"}`}>
          Dashboard
        </Link>
      </div>
      <div className="flex gap-2 items-center">
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="rounded-full border border-black dark:border-white cursor-pointer"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        {session?.user.forename ? (
          <>
            <Link
              href="/profile"
              className={`link ${path === "/profile" && "underline"}`}
            >
              Profile
            </Link>
            <Button
              variant={"link"}
              className="p-0 text-md font-normal text-base cursor-pointer link"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={`link ${path === "/login" && "underline"}`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`link ${path === "/register" && "underline"}`}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
