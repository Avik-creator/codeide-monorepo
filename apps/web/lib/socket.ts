// client/socket.ts
import { io } from "socket.io-client";

import { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:9000");
export default socket;
