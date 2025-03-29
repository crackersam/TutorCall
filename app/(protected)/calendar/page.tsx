import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import CalendarGrid from "./calendar-grid";

const Calendar = async () => {
  const user = await auth();
  const id = user?.user.id;
  const calls = await prisma.call.findMany({
    where: {
      userId: id,
    },
    include: {
      student: true,
    },
  });
  const descriptions = calls.map((call) => call.description);
  const names = calls.map((call) => {
    return `${call.student.forename} ${call.student.surname}`;
  });
  const dates = calls.map((call) => call.date);

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Calendar</h1>
      </div>
      <div className="">
        <CalendarGrid names={names} dates={dates} descriptions={descriptions} />
      </div>
    </div>
  );
};

export default Calendar;
