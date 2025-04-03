import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import Image from "next/image";
import Link from "next/link";
import Requests from "./requests";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await auth();
  if (session?.user.id && !session?.user.mobileVerified) {
    redirect("/verify-mobile");
  }
  if (session?.user.role === "STUDENT" || !session) {
    const tutors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
      },
    });

    return (
      <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
        <div className="flex justify-center">
          <h1 className="text-xl justify-center underline mb-3">
            Welcome to Tutacall
          </h1>
        </div>
        <p className="my-3 text-center">
          Below is a list of tutors available for you to book a call with.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {tutors &&
            tutors.map((tutor) => (
              <Link href={`/tutors/${tutor.id}`} key={tutor.id}>
                <Card className="w-[200px]">
                  <CardHeader>
                    <CardTitle>
                      {" "}
                      {tutor.forename[0].toUpperCase() +
                        tutor.forename.slice(1)}{" "}
                      {tutor.surname[0].toUpperCase() + tutor.surname.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      {" "}
                      {tutor.subject
                        ? tutor.subject[0].toUpperCase() +
                          tutor.subject.slice(1)
                        : "Unavailable"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      {tutor.image ? (
                        <Image
                          src={tutor.image!}
                          width={100}
                          height={100}
                          alt={tutor.forename}
                          className="rounded-full border  border-[#c4xc7c8] dark:border-[#444746]"
                          priority
                        />
                      ) : (
                        <div className="w-[100px] h-[100px] rounded-full bg-gray-200 dark:bg-black  border-[#c4xc7c8] dark:border-[#444746] border"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    );
  } else {
    const callRequests = await prisma.callRequest.findMany({
      where: {
        instructorId: session?.user.id,
      },
      include: {
        student: true,
      },
    });
    const indeces = callRequests.map((callRequest) => {
      return callRequest.callRequestId;
    });
    const studentIds = callRequests.map((callRequest) => {
      return callRequest.student.id;
    });

    const names = callRequests.map((callRequest) => {
      return `${callRequest.student.forename[0].toUpperCase()}${callRequest.student.forename.slice(
        1
      )} ${callRequest.student.surname[0].toUpperCase()}${callRequest.student.surname.slice(
        1
      )}`;
    });
    const date1 = callRequests.map((callRequest) => {
      return new Date(callRequest.date1);
    });
    const date2 = callRequests.map((callRequest) => {
      return new Date(callRequest.date2);
    });
    const date3 = callRequests.map((callRequest) => {
      return new Date(callRequest.date3);
    });
    const details = callRequests.map((callRequest) => {
      return `${callRequest.details}`;
    });
    const images = callRequests.map((callRequest) => {
      return callRequest.student.image || "";
    });
    return (
      <Requests
        indeces={indeces}
        names={names}
        date1={date1}
        date2={date2}
        date3={date3}
        studentIds={studentIds}
        details={details}
        images={images}
        session={session}
      />
    );
  }
};

export default Dashboard;
