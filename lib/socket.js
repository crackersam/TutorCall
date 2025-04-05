"use client";

import { io } from "socket.io-client";

export const socketForTwo = io("/two-peers");
