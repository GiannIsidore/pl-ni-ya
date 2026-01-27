import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { canAccessAdminPanel } from "./lib/permissions";

// Routes that require authentication
const protectedRoutes = [
  "/profile",
  "/settings",
];

// Routes that require admin or moderator role
const adminRoutes = [
  "/admin",
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
  (context.locals as any).session = session?.session ?? null;
  (context.locals as any).user = session?.user ?? null;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // 1. Handle protected routes
  if (isProtectedRoute && !session) {
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/login?returnUrl=${returnUrl}`);
  }

  // 2. Handle admin routes
  if (isAdminRoute) {
    if (!session) {
      const returnUrl = encodeURIComponent(pathname);
      return context.redirect(`/login?returnUrl=${returnUrl}`);
    }

    // Check if user has admin or moderator role
    if (!canAccessAdminPanel(session?.user as any)) {
      return context.redirect('/?unauthorized=true');
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const userRole = (session.user as any)?.role;
    const canAccessAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';

    const urlParams = new URLSearchParams(context.url.search);
    const returnUrl = urlParams.get('returnUrl');

    if (canAccessAdmin && !returnUrl) {
      return context.redirect("/admin");
    }

    return context.redirect(returnUrl || "/");
  }

  // 4. Handle request and set security/cache headers
  const response = await next();

  // Prevent caching for sensitive pages to avoid BFcache/stale session issues
  if (isProtectedRoute || isAdminRoute || isAuthRoute || session) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});