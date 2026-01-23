import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

// Get trusted origins from auth config
const trustedOrigins = [
  "http://localhost:4321",
  "http://localhost:4322",
  process.env.BETTER_AUTH_URL || "",
].filter(Boolean);

function getCorsHeaders(request: Request): Headers {
  const origin = request.headers.get("origin");
  const headers = new Headers();
  
  // If there's an origin header, it's a CORS request
  // Only set CORS headers if the origin is trusted
  if (origin && trustedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  }
  
  return headers;
}

async function handleRequest(request: Request): Promise<Response> {
  // Handle OPTIONS preflight requests
  if (request.method === "OPTIONS") {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // Handle actual requests
  const response = await auth.handler(request);
  
  // Add CORS headers to the response
  const corsHeaders = getCorsHeaders(request);
  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export const ALL: APIRoute = async ({ request }) => {
  return handleRequest(request);
};

// Better Auth expects these methods to be exported
export const GET: APIRoute = async ({ request }) => {
  return handleRequest(request);
};

export const POST: APIRoute = async ({ request }) => {
  return handleRequest(request);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};
