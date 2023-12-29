import { io } from "socket.io-client";

export const socket = io("https://droplet.craigsmith.dev", {
	autoConnect: false,
	transports: ["websocket"],
});
