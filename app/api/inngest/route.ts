import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { inngestFunctions } from "@/lib/inngest/functions";

// Create an API route that serves all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
