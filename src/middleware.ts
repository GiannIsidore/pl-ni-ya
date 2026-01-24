import { defineMiddleware } from "astro:middleware";
import { getSession, verifyUser } from "./lib/authorization";
import { hasMinimumRole } from "./types/auth";

// Routes that require authentication (session only, no DB check)
const protectedRoutes = [
  "/profile",
  "/settings",
];

// Routes that require admin or moderator role (requires DB verification)
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
  const session = await getSession(context.request);
  
  // Store session data in locals (may be stale)
  context.locals.session = session?.session ?? null;
  context.locals.user = session?.user ?? null;
  context.locals.verifiedUser = null; // Will be populated if needed
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/login?returnUrl=${returnUrl}`);
  }
  
  // Check if route requires admin access (requires DB verification)
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  if (isAdminRoute) {
    if (!session || !session.user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname);
      return context.redirect(`/login?returnUrl=${returnUrl}`);
    }
    
    // Verify user from database and check role
    const verifiedUser = await verifyUser(session.user.id, context.request);
    
    if (!verifiedUser) {
      // User no longer exists in database
      return context.redirect('/login?error=user-not-found');
    }
    
    if (verifiedUser.isBanned) {
      // User is banned
      return context.redirect(`/banned?reason=${encodeURIComponent(verifiedUser.banReason || 'Account suspended')}`);
    }
    
    // Check if user has minimum moderator role
    if (!hasMinimumRole(verifiedUser, 'MODERATOR')) {
      // Insufficient permissions
      return context.redirect('/?error=unauthorized');
    }
    
    // Store verified user for use in admin pages
    context.locals.verifiedUser = verifiedUser;
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  
  if (isAuthRoute && session) {
    // Get verified user to check role
    const verifiedUser = await verifyUser(session.user.id, context.request);
    
    if (verifiedUser && hasMinimumRole(verifiedUser, 'MODERATOR')) {
      // Check if there's a return URL parameter
      const urlParams = new URLSearchParams(context.url.search);
      const returnUrl = urlParams.get('returnUrl');
      
      if (!returnUrl) {
        // Redirect admin/moderator users to admin dashboard
        return context.redirect("/admin");
      }
    }
    
    // Check for return URL
    const urlParams = new URLSearchParams(context.url.search);
    const returnUrl = urlParams.get('returnUrl');
    
    // Otherwise redirect to home or return URL
    return context.redirect(returnUrl || "/");
  }
  
  return next();
});