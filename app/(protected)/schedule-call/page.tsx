import React from "react";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import ScheduleForm from "./schedule-form";

const AddEvent = async () => {
  const session = await auth();
  const emailObjs = await prisma.user.findMany({
    select: {
      email: true,
    },
    where: {
      role: "USER",
    },
  });
  const emails = emailObjs.map((e) => e.email);

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Schedule Call</h1>
      </div>
      <div className="flex gap-2 justify-center">
        {session && <ScheduleForm emails={emails} session={session} />}
      </div>
    </div>
  );
};

export default AddEvent;
