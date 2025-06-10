import { io } from "socket.io-client";

export const socket = io("https://doodle-duel-896989562989.us-central1.run.app", {
	autoConnect: false,
	transports: ["websocket"],
});
