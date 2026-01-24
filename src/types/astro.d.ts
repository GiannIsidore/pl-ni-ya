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

export {};