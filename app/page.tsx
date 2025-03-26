import React from "react";
import { auth } from "@/auth";

const Dashboard = async () => {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  } else {
    return (
      <div>
        Dashboard for {session?.user.forename} {session.user.surname}
      </div>
    );
  }
};

export default Dashboard;
