import { Inngest } from "inngest";

// Create an Inngest client to send and receive events
export const inngest = new Inngest({
  id: "clip-craft",
  name: "ClipCraft",
  isDev: process.env.NODE_ENV === "development",
});
