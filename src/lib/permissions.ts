import type { User } from '@prisma/client';

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export function hasRole(user: User | null | undefined, requiredRole: Role): boolean {
	if (!user) return false;
	
	const roleHierarchy = {
		'USER': 0,
		'MODERATOR': 1,
		'ADMIN': 2
	};
	
	const userRoleLevel = roleHierarchy[user.role as Role] || 0;
	const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
	
	return userRoleLevel >= requiredRoleLevel;
}

export function isAdmin(user: User | null | undefined): boolean {
	return hasRole(user, 'ADMIN');
}

export function isModerator(user: User | null | undefined): boolean {
	return hasRole(user, 'MODERATOR');
}

export function canAccessAdminPanel(user: User | null | undefined): boolean {
	return isAdmin(user) || isModerator(user);
}

export function hasPermission(user: User | null | undefined, permission: string): boolean {
	if (!user) return false;
	
	const adminPermissions = [
		'BLOG_CREATE',
		'BLOG_EDIT_ANY',
		'BLOG_DELETE',
		'THREAD_MODERATE',
		'USER_BAN',
		'USER_MANAGE_ROLES',
		'ADMIN_PANEL_ACCESS',
		'SYSTEM_SETTINGS'
	];
	
	const moderatorPermissions = [
		'BLOG_CREATE',
		'THREAD_MODERATE',
		'USER_BAN',
		'ADMIN_PANEL_ACCESS'
	];
	
	if (user.role === 'ADMIN') {
		return adminPermissions.includes(permission);
	}
	
	if (user.role === 'MODERATOR') {
		return moderatorPermissions.includes(permission);
	}
	
	return false;
}