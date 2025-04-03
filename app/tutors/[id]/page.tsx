import React from "react";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CallRequestForm from "./call-request-form";

const AddEvent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  const { id } = await params;
  const tutor = await prisma.user.findUnique({
    where: {
      id,
      role: "INSTRUCTOR",
    },
  });
  if (!tutor) {
    return <div>Tutor not found</div>;
  }

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Tutor details</h1>
      </div>
      <div className="flex gap-2 align-middle justify-evenly flex-wrap">
        {tutor.image && (
          <Image
            src={tutor.image!}
            width={200}
            height={200}
            alt={tutor.forename}
            className="rounded-full h-[200px] w-[200px] border border-black dark:border-white"
            priority
          />
        )}{" "}
        <Card className="w-[360px]">
          <CardHeader>
            <CardTitle>
              {tutor.forename[0].toUpperCase() + tutor.forename.slice(1)}{" "}
              {tutor.surname[0].toUpperCase() + tutor.surname.slice(1)}
            </CardTitle>
            <CardDescription>
              Instructing in{" "}
              {tutor.subject
                ? tutor.subject[0].toUpperCase() + tutor.subject.slice(1)
                : "Unavailable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{tutor.biography}</p>
          </CardContent>
          <CardFooter>
            {session && session.user && (
              <CallRequestForm
                tutorId={id}
                studentId={session.user.id}
                user={session.user}
                tutor={{
                  ...tutor,
                  subject: tutor.subject || "Unavailable",
                }}
              />
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddEvent;
