"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import ScheduleForm from "./schedule-form";
import { Session } from "next-auth";

const Requests = ({
  indeces,
  names,
  date1,
  date2,
  date3,
  details,
  images,
  studentIds,
  session,
}: {
  indeces: string[];
  names: string[];
  date1: Date[];
  date2: Date[];
  date3: Date[];
  details: string[];
  images: string[];
  studentIds: string[];
  session: Session;
}) => {
  const [currentRequest, setCurrentRequest] = React.useState<number>(0);
  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Dashboard</h1>
      </div>
      <div className="flex flex-wrap gap-4 items-stretch justify-center">
        <div className="bg-blue-200 dark:bg-blue-950 border border-blue-700 flex flex-col items-stretch flex-1/4 py-2 px-2 rounded-md">
          <h2 className="text-lg justify-center mx-auto underline py-2 px-2">
            Call requests
          </h2>
          <ul>
            {indeces.map((index, i) => (
              <li
                key={index}
                onClick={() => setCurrentRequest(i)}
                className={`py-1 px-2 my-4 rounded-sm bg-blue-300 dark:bg-blue-950 border border-blue-500 cursor-pointer ${
                  currentRequest === i ? "!bg-blue-400 dark:!bg-blue-900" : ""
                }`}
              >
                <span className={`${currentRequest === i && "font-bold"}`}>
                  {names[i]}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-2/3 bg-blue-200 dark:bg-blue-950 border-blue-700 border rounded-md gap-3 flex flex-col items-stretch py-2 pb-4 px-4">
          <h2 className="text-lg justify-center mx-auto underline pt-2 px-2">
            Details
          </h2>
          {currentRequest !== undefined && images[currentRequest] ? (
            <Image
              src={images[currentRequest]} // Access the correct image URL
              width={200}
              height={200}
              alt="User avatar"
              className="rounded-full mx-auto mt-3 mb-2 border border-black dark:border-white"
              priority
            />
          ) : (
            <div className="w-32 h-32 mx-auto m-4 bg-gray-200 dark:bg-blue-950 dark:border-white border border-white rounded-full"></div>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button className=" w-52">Schedule call</Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule call</DialogTitle>
              </DialogHeader>
              {currentRequest !== undefined && studentIds[currentRequest] && (
                <ScheduleForm
                  studentId={studentIds[currentRequest]}
                  tutorId={session.user.id}
                />
              )}
            </DialogContent>
          </Dialog>
          <p className="">
            Student:{" "}
            {currentRequest !== undefined ? names[currentRequest] : "N/A"}
          </p>
          <p className="">
            Details:{" "}
            {currentRequest !== undefined ? details[currentRequest] : "N/A"}
          </p>
          <p className="">
            Prospective date 1:{" "}
            {currentRequest !== undefined
              ? format(date1[currentRequest], "dd/MM/yyyy HH:mm")
              : "N/A"}
          </p>
          <p className="">
            Prospective date 2:{" "}
            {currentRequest !== undefined
              ? format(date2[currentRequest], "dd/MM/yyyy HH:mm")
              : "N/A"}
          </p>
          <p className="">
            Prospective date 3:{" "}
            {currentRequest !== undefined
              ? format(date3[currentRequest], "dd/MM/yyyy HH:mm")
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Requests;
