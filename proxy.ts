import { clerkMiddleware } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest } from "next/server";
import { hasClerkEnv } from "@/lib/clerk/env";
import { updateSession } from "@/lib/supabase/proxy";

const handleClerk = clerkMiddleware(async (_auth, request) => {
  return updateSession(request);
});

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkEnv()) {
    return updateSession(request);
  }

  return handleClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
