// Global type declarations for the project
declare global {
	namespace Astro {
		interface Locals {
			session: any;
			user: any;
		}
	}
}

// Extend Better Auth types to include role
declare module "better-auth/types" {
	interface User {
		role: 'USER' | 'MODERATOR' | 'ADMIN';
		isBanned?: boolean;
		bannedAt?: Date | null;
		bannedBy?: string | null;
		banReason?: string | null;
		bannedUntil?: Date | null;
	}
}

// Prisma type extensions
declare module '@prisma/client' {
	interface User {
		role: 'USER' | 'MODERATOR' | 'ADMIN';
		isBanned?: boolean;
		bannedAt?: Date | null;
		bannedBy?: string | null;
		banReason?: string | null;
		bannedUntil?: Date | null;
	}
}

// Extend auth result types
declare module "better-auth" {
	interface AuthResult {
		data?: {
			user?: {
				id: string;
				email: string;
				name: string;
				username: string;
				role: 'USER' | 'MODERATOR' | 'ADMIN';
				emailVerified: boolean;
			};
		};
		error?: {
			message: string;
		};
	}
}

export {};