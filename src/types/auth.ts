/**
 * Role hierarchy for authorization
 */
export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

/**
 * Prisma User type (mirrors database schema)
 */
export interface PrismaUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatar: string | null;
  role: Role;
  isBanned: boolean;
  bannedAt: Date | null;
  bannedBy: string | null;
  banReason: string | null;
  bannedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * System permissions
 */
export type Permission =
  | 'BLOG_CREATE'
  | 'BLOG_EDIT_ANY'
  | 'BLOG_DELETE'
  | 'THREAD_MODERATE'
  | 'USER_BAN'
  | 'USER_MANAGE_ROLES'
  | 'ADMIN_PANEL_ACCESS'
  | 'SYSTEM_SETTINGS';

/**
 * Authenticated user with verified data from database
 * This type ensures we're working with fresh, validated user data
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatar: string | null;
  role: Role;
  isBanned: boolean;
  bannedAt: Date | null;
  bannedBy: string | null;
  banReason: string | null;
  bannedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session data from Better Auth
 */
export interface AuthSession {
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    image?: string | null;
    avatar?: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Request context with verified authentication
 */
export interface AuthContext {
  session: AuthSession | null;
  user: AuthSession['user'] | null;
  verifiedUser: AuthUser | null;
}

/**
 * Type guard to check if user has a specific role
 */
export function isRole(user: AuthUser | null | undefined, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Type guard to check if a role meets minimum requirements
 */
export function hasMinimumRole(
  user: AuthUser | null | undefined,
  minimumRole: Role
): boolean {
  if (!user) return false;

  const roleHierarchy: Record<Role, number> = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
  };

  const userLevel = roleHierarchy[user.role];
  const requiredLevel = roleHierarchy[minimumRole];

  return userLevel >= requiredLevel;
}

/**
 * Convert Prisma User to AuthUser
 */
export function toAuthUser(user: PrismaUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    isBanned: user.isBanned,
    bannedAt: user.bannedAt,
    bannedBy: user.bannedBy,
    banReason: user.banReason,
    bannedUntil: user.bannedUntil,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
