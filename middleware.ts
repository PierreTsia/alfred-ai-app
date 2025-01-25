import {
  clerkMiddleware,
  createRouteMatcher,
  getAuth,
  clerkClient,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/api/getChat(.*)"]);

const WHITELISTED_EMAILS = [
  "pt2kos@gmail.com",
  "pierre.tsiakkaros@gmail.com",
  "margotpierre5@gmail.com",
];

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // For the protected getChat API route, require authentication
  if (isProtectedRoute(req)) {
    // Ensure it's a POST request for API routes
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!userId) {
      return redirectToSignIn();
    }

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const primaryEmail = user.emailAddresses.find(
        (email: { id: string }) => email.id === user.primaryEmailAddressId,
      )?.emailAddress;

      // Check whitelist to prevent access to the API (that costs money !!!)
      if (!primaryEmail || !WHITELISTED_EMAILS.includes(primaryEmail)) {
        return new Response("Unauthorized: Email not whitelisted", {
          status: 403,
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      return new Response("Error verifying user access", { status: 500 });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
