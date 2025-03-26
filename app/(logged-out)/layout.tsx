import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const LoggedOutLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();
  if (!session?.user) {
    return <div>{children}</div>;
  } else {
    redirect("/");
  }
};

export default LoggedOutLayout;
