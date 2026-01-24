import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

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
  
  // Enhanced session handling with role check
  let user = null;
  let userRole = null;
  
  if (session?.user) {
    // Get fresh user data from database to ensure role is included
    try {
      const { prisma } = await import('../lib/prisma.js');
      const fullUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          emailVerified: true,
          isBanned: true,
        }
      });
      
      if (fullUser) {
        user = fullUser;
        userRole = fullUser.role;
        console.log('Enhanced middleware - User role from DB:', userRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Fallback to session user
      user = session.user;
      userRole = (session.user as any)?.role;
    }
  }
  
  // Store session and user in locals
  (context.locals as any).session = session?.session ?? null;
  (context.locals as any).user = user;
  
  // Debug logging
  console.log('Middleware - Enhanced session user:', user);
  console.log('Middleware - User role:', userRole);
  
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
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MODERATOR')) {
      // Redirect to home with unauthorized message
      return context.redirect('/?unauthorized=true');
    }
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  
  if (isAuthRoute && session) {
    // Check if user is admin and redirect to admin dashboard
    if (userRole && (userRole === 'ADMIN' || userRole === 'MODERATOR')) {
      // Check if there's a return URL parameter
      const urlParams = new URLSearchParams(context.url.search);
      const returnUrl = urlParams.get('returnUrl');
      
      if (!returnUrl) {
        // Redirect admin users to admin dashboard
        return context.redirect("/admin");
      }
      
      // Otherwise redirect to home or return URL
      return context.redirect(returnUrl || "/");
    }
    
    // Otherwise redirect to home
    return context.redirect("/");
  }
  
  // Check if user is admin accessing home page
  if (userRole && (userRole === 'ADMIN' || userRole === 'MODERATOR') && pathname === '/' && !session) {
    // This should not happen with enhanced session, but keep as fallback
    return context.redirect("/admin");
  }
  
  return next();
});