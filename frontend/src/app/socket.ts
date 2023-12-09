import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

export const socket = io("http://192.168.0.24:4000", {
    autoConnect: false
  });