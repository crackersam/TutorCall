"use client";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Header = ({ session }: { session: Session | null }) => {
  const { theme, setTheme } = useTheme();
  const path = usePathname();
  const router = useRouter();
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
        {session?.user.forename ? (
          <>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="cursor-pointer">
                <Avatar className="">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.forename}
                      width={32}
                      height={32}
                      className="rounded-full cursor-pointer border border-black dark:border-white"
                    />
                  )}
                  {!session.user.image && (
                    <AvatarFallback>
                      <div className="font-bold">
                        {session.user.forename[0]}
                      </div>
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  {" "}
                  <div className="mb-4 p-4 flex flex-col gap-1 items-center rounded-lg  bg-primary/10">
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.forename!}
                        className="rounded-full border border-black dark:border-white"
                        width={100}
                        height={100}
                      />
                    )}
                    <p className="font-bold text-xs">{session.user.name}</p>
                    <span className="text-xs font-medium text-secondary-foreground">
                      {session.user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/calendar")}>
                  Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/schedule-call")}>
                  Schedule call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
