import type { APIContext } from 'astro';
import prisma from './prisma';
import { auth } from './auth';
import type { AuthUser, AuthSession, Role, Permission, PrismaUser } from '../types/auth';
import { toAuthUser, hasMinimumRole } from '../types/auth';

/**
 * Request-scoped cache to avoid multiple DB queries for the same user
 */
const requestCache = new WeakMap<Request, Map<string, AuthUser>>();

function getRequestCache(request: Request): Map<string, AuthUser> {
  if (!requestCache.has(request)) {
    requestCache.set(request, new Map());
  }
  return requestCache.get(request)!;
}

/**
 * Get session from Better Auth
 * Returns null if not authenticated
 */
export async function getSession(request: Request): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

/**
 * Verify user exists in database and is not banned
 * Returns fresh user data from DB
 * Caches result per-request to avoid duplicate queries
 */
export async function verifyUser(userId: string, request: Request): Promise<AuthUser | null> {
  // Check cache first
  const cache = getRequestCache(request);
  if (cache.has(userId)) {
    return cache.get(userId)!;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        name: true,
        avatar: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedBy: true,
        banReason: true,
        bannedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const authUser = toAuthUser(user as PrismaUser);
    
    // Cache the result
    cache.set(userId, authUser);
    
    return authUser;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

/**
 * Require authenticated user with fresh data from database
 * Throws 401 if not authenticated
 * Throws 403 if banned
 * Returns verified user data
 */
export async function requireVerifiedUser(request: Request): Promise<AuthUser> {
  const session = await getSession(request);
  
  if (!session || !session.user) {
    throw new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const user = await verifyUser(session.user.id, request);
  
  if (!user) {
    // User was deleted from database
    throw new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (user.isBanned) {
    // Check if temporary ban has expired
    if (user.bannedUntil && new Date() > user.bannedUntil) {
      // Ban expired, update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isBanned: false,
          bannedAt: null,
          bannedBy: null,
          banReason: null,
          bannedUntil: null,
        },
      });
      
      // Clear cache and re-fetch
      const cache = getRequestCache(request);
      cache.delete(user.id);
      return requireVerifiedUser(request);
    }
    
    throw new Response(
      JSON.stringify({
        error: 'Account banned',
        reason: user.banReason,
        bannedUntil: user.bannedUntil,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Require user with specific role (or higher in hierarchy)
 * Throws 401 if not authenticated
 * Throws 403 if insufficient role or banned
 * Returns verified user data with required role
 */
export async function requireRole(request: Request, requiredRole: Role): Promise<AuthUser> {
  const user = await requireVerifiedUser(request);
  
  if (!hasMinimumRole(user, requiredRole)) {
    throw new Response(
      JSON.stringify({ 
        error: 'Insufficient permissions', 
        required: requiredRole,
        current: user.role,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Require user with specific permission
 * Throws 401 if not authenticated
 * Throws 403 if missing permission or banned
 * Returns verified user data
 */
export async function requirePermission(request: Request, permission: Permission): Promise<AuthUser> {
  const user = await requireVerifiedUser(request);
  
  if (!hasPermission(user, permission)) {
    throw new Response(
      JSON.stringify({ 
        error: 'Insufficient permissions',
        required: permission,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  const adminPermissions: Permission[] = [
    'BLOG_CREATE',
    'BLOG_EDIT_ANY',
    'BLOG_DELETE',
    'THREAD_MODERATE',
    'USER_BAN',
    'USER_MANAGE_ROLES',
    'ADMIN_PANEL_ACCESS',
    'SYSTEM_SETTINGS',
  ];
  
  const moderatorPermissions: Permission[] = [
    'BLOG_CREATE',
    'THREAD_MODERATE',
    'USER_BAN',
    'ADMIN_PANEL_ACCESS',
  ];
  
  if (user.role === 'ADMIN') {
    return adminPermissions.includes(permission);
  }
  
  if (user.role === 'MODERATOR') {
    return moderatorPermissions.includes(permission);
  }
  
  return false;
}

/**
 * Check if user can modify a thread (is author or moderator+)
 */
export async function canModifyThread(user: AuthUser, threadId: number): Promise<boolean> {
  // Moderators and admins can modify any thread
  if (hasMinimumRole(user, 'MODERATOR')) {
    return true;
  }

  // Check if user is the author
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { authorId: true },
  });

  return thread?.authorId === user.id;
}

/**
 * Check if user can modify a comment (is author or moderator+)
 */
export async function canModifyComment(user: AuthUser, commentId: number): Promise<boolean> {
  // Moderators and admins can modify any comment
  if (hasMinimumRole(user, 'MODERATOR')) {
    return true;
  }

  // Check if user is the author
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  return comment?.authorId === user.id;
}

/**
 * Check if user can modify a blog (is author or admin)
 */
export async function canModifyBlog(user: AuthUser, blogId: number): Promise<boolean> {
  // Only admins can modify blogs
  if (user.role === 'ADMIN') {
    return true;
  }

  // Check if user is the author
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true },
  });

  return blog?.authorId === user.id;
}

/**
 * Require ownership or moderator+ role for thread
 */
export async function requireThreadOwnership(request: Request, threadId: number): Promise<AuthUser> {
  const user = await requireVerifiedUser(request);
  
  if (!(await canModifyThread(user, threadId))) {
    throw new Response(
      JSON.stringify({ error: 'You do not have permission to modify this thread' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Require ownership or moderator+ role for comment
 */
export async function requireCommentOwnership(request: Request, commentId: number): Promise<AuthUser> {
  const user = await requireVerifiedUser(request);
  
  if (!(await canModifyComment(user, commentId))) {
    throw new Response(
      JSON.stringify({ error: 'You do not have permission to modify this comment' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Require ownership or admin role for blog
 */
export async function requireBlogOwnership(request: Request, blogId: number): Promise<AuthUser> {
  const user = await requireVerifiedUser(request);
  
  if (!(await canModifyBlog(user, blogId))) {
    throw new Response(
      JSON.stringify({ error: 'You do not have permission to modify this blog' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Helper responses
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

export function forbiddenResponse(message = 'Access denied') {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
