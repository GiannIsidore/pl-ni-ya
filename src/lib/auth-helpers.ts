import type { APIContext } from "astro";
import { auth } from "./auth";

export type AuthSession = typeof auth.$Infer.Session;

/**
 * Get the current session from an API request
 * Returns null if not authenticated
 */
export async function getSession(request: Request): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

/**
 * Get the current user ID from an API request
 * Returns null if not authenticated
 */
export async function getCurrentUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session?.user?.id ?? null;
}

/**
 * Require authentication for an API endpoint
 * Returns the session or throws a 401 response
 */
export async function requireAuth(context: APIContext): Promise<AuthSession> {
  const session = await getSession(context.request);
  
  if (!session) {
    throw new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  return session;
}

/**
 * Helper to create an unauthorized response
 */
export function unauthorizedResponse(message = "Authentication required") {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Helper to create a forbidden response
 */
export function forbiddenResponse(message = "Access denied") {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
