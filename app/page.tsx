import React from "react";
import { auth } from "@/auth";

const Dashboard = async () => {
  const session = await auth();
  if (!session?.user) {
    return <div>Unauthorized</div>;
  } else {
    return <div>Dashboard</div>;
  }
};

export default Dashboard;
