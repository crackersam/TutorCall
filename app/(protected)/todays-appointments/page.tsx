import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { format } from "date-fns";
import Link from "next/link";

const TodaysAppointments = async () => {
  const session = await auth();
  const twentyFourHours = new Date();
  twentyFourHours.setHours(twentyFourHours.getHours() + 24);
  const appointments = await prisma.call.findMany({
    where: {
      OR: [
        {
          studentId: session!.user.id,
        },
        {
          instructorId: session!.user.id,
        },
      ],
      date: {
        gte: new Date(),
        lte: twentyFourHours,
      },
    },
    include: {
      instructor: {
        select: {
          forename: true,
          surname: true,
        },
      },
      student: {
        select: {
          forename: true,
          surname: true,
        },
      },
    },
  });
  const todaysAppointments = appointments.length;

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-0 sm:p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">
          Today&#39;s appointments
        </h1>
      </div>

      <div className=" bg-white dark:bg-black text-foreground rounded-lg justify-center flex-wrap flex-col flex gap-2 p-0 sm:p-4">
        <p className="text-center">
          You have{" "}
          {todaysAppointments === 1
            ? "1 appointment "
            : `${todaysAppointments} appointments `}
          within the next 24 hours.
        </p>
        <div className="flex flex-col ">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">With</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 &&
                appointments.map((appointment) => (
                  <tr
                    className="border-b border-[#c4c7c5] dark:border-{#444746]"
                    key={appointment.callId}
                  >
                    <td className="text-left p-2">
                      {format(appointment.date, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="text-left p-2">
                      {session?.user.role === "STUDENT"
                        ? `${appointment.instructor.forename} ${appointment.instructor.surname}`
                        : `${appointment.student.forename} ${appointment.student.surname}`}
                    </td>
                    <td className="text-left p-2">{appointment.description}</td>
                    <td className="text-left p-2">
                      <Link
                        className="hover:underline"
                        href={`${process.env.BASE_URL}/call?id=${appointment.callId}`}
                      >
                        Waiting room
                      </Link>
                    </td>
                  </tr>
                ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    No appointments found. Please arrange a call with a
                    {session?.user.role === "STUDENT"
                      ? "n instructor"
                      : "student"}
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TodaysAppointments;
