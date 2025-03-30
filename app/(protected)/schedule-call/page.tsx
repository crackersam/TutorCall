import React from "react";
import { auth } from "@/auth";
import ScheduleForm from "./schedule-form";

const AddEvent = async () => {
  const session = await auth();

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Schedule Call</h1>
      </div>
      <div className="flex gap-2 justify-center">
        {session && <ScheduleForm session={session} />}
      </div>
    </div>
  );
};

export default AddEvent;
