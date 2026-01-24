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
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/login?returnUrl=${returnUrl}`);
  }
  
  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  if (isAdminRoute) {
    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname);
      return context.redirect(`/login?returnUrl=${returnUrl}`);
    }
    
    // Check if user has admin or moderator role
    if (!canAccessAdminPanel(session?.user as any)) {
      // Redirect to home with unauthorized message
      return context.redirect('/?unauthorized=true');
    }
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  
  if (isAuthRoute && session) {
    // Check if user is admin and redirect to admin dashboard
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
    
    // Check if there's a return URL parameter
    const urlParams = new URLSearchParams(context.url.search);
    const returnUrl = urlParams.get('returnUrl');
    
    if (isAdmin && !returnUrl) {
      // Redirect admin users to admin dashboard
      return context.redirect("/admin");
    }
    
    // Otherwise redirect to home or return URL
    return context.redirect(returnUrl || "/");
  }
  
  return next();
});