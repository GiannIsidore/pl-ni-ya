import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { canAccessAdminPanel } from "./lib/permissions";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

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
  
  // Enhanced user handling with role verification
  let user = session?.user ?? null;
  let userRole = null;
  let isAdmin = false;
  
  if (session?.user) {
    userRole = (session.user as any).role;
    isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
    
    // Verify admin status from database for extra security
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBanned: true }
      });
      
      if (dbUser) {
        userRole = dbUser.role;
        isAdmin = dbUser.role === 'ADMIN' || dbUser.role === 'MODERATOR';
        
        // Check if user is banned, deny access
        if (dbUser.isBanned) {
          return context.redirect('/?banned=true');
        }
      }
    } catch (error) {
      console.error('Error verifying user role:', error);
    }
  }
  
  console.log('Middleware - User role:', userRole);
  console.log('Middleware - Is admin:', isAdmin);
  
  // Store session and user in locals
  (context.locals as any).session = session?.session ?? null;
  (context.locals as any).user = user;
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/login?returnUrl=${returnUrl}`);
  }
  
  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  if (isAdminRoute) {
    if (!session || !isAdmin) {
      const returnUrl = encodeURIComponent(pathname);
      return context.redirect(`/login?returnUrl=${returnUrl}`);
    }
    
    // Check if there's a return URL parameter for auth pages
    const isAuthRoute = authRoutes.some((route) => pathname === route);
    if (isAuthRoute && session) {
      const urlParams = new URLSearchParams(context.url.search);
      const returnUrl = urlParams.get('returnUrl');
      
      if (isAdmin && !returnUrl) {
        return context.redirect("/admin");
      }
      
      return context.redirect(returnUrl || "/");
    }
  }
  
  // Check if admin user accessing home page
  if (isAdmin && pathname === '/' && session) {
    return context.redirect("/admin");
  }
  
  return next();
});