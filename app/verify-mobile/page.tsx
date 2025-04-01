import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VerifyMobileForm } from "./verify-mobile-form";

const VerifyMobile = async () => {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login");
  } else if (session?.user.mobileVerified) {
    return redirect("/");
  }
  return (
    <div className="flex w-full items-center flex-col justify-center">
      <div className="sm:w-[400px] w-[100%] bg-white dark:bg-black text-foreground rounded-lg border-black dark:border-white border flex flex-col gap-5 p-4">
        <h1 className="text-2xl mx-auto font-bold">Verify Mobile</h1>

        <VerifyMobileForm />
      </div>
    </div>
  );
};

export default VerifyMobile;
