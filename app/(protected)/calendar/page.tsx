import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import CalendarGrid from "./calendar-grid";

const Calendar = async () => {
  const session = await auth();
  const id = session?.user.id;
  const calls = await prisma.call.findMany({
    where: {
      OR: [
        {
          studentId: id,
        },
        {
          instructorId: id,
        },
      ],
    },
    include: {
      student: true,
      instructor: true,
    },
  });
  const descriptions = calls.map((call) => call.description);
  const names = calls.map((call) => {
    return `${
      session?.user.role === "INSTRUCTOR"
        ? `${call.student.forename} ${call.student.surname}`
        : `${call.instructor.forename} ${call.instructor.surname}`
    }`;
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
