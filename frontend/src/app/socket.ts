import { io } from "socket.io-client";

export const socket = io("https://doodle-duel-896989562989.europe-west1.run.app", {
	autoConnect: false,
	transports: ["websocket"],
});
