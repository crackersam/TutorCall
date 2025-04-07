import React from "react";
import Call from "./call";
import { auth } from "@/auth";

const CallPage = async () => {
  const session = await auth();
  const { forename, surname } = session?.user ?? {};
  const name = `${forename} ${surname}`;
  return <Call name={name} />;
};

export default CallPage;
