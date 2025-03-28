import React from "react";
import { auth } from "@/auth";

const Dashboard = async () => {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  } else {
    return (
      <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
        <div className="flex justify-center">
          <h1 className="text-xl justify-center underline mb-3">
            Dashboard for {session?.user.forename} {session.user.surname}
          </h1>
        </div>
        <div className="flex gap-2 justify-center">Hiyaaa</div>
      </div>
    );
  }
};

export default Dashboard;
