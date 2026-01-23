import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

// Routes that require authentication
const protectedRoutes = [
  "/profile",
  "/settings",
];

// Routes that should redirect to home if already authenticated
const authRoutes = [
  "/login",
  "/signup",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  
  // Store session in locals for access in pages/components
  context.locals.session = session?.session ?? null;
  context.locals.user = session?.user ?? null;
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/login?returnUrl=${returnUrl}`);
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  
  if (isAuthRoute && session) {
    return context.redirect("/");
  }
  
  return next();
});
