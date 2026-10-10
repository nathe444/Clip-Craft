import { inngest } from "../client";

/**
 * Hello World test function for Inngest
 * Listens for: "test/hello.world"
 */
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    name: "Hello World Test Function",
    triggers: [{ event: "test/hello.world" }],
  },
  async ({ event, step }) => {
    // 1. Simulate a quick step
    await step.sleep("wait-a-moment", "1s");

    // 2. Return payload
    const name = (event.data as { name?: string } | undefined)?.name || "World";
    return {
      message: `Hello ${name}! Inngest is working successfully in ClipCraft.`,
      receivedAt: new Date().toISOString(),
      eventData: event.data,
    };
  }
);
