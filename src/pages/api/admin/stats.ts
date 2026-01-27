import { requireRole } from '../../../lib/authorization';
import { getDashboardStats } from '../../../lib/services/dashboard';

export async function GET({ request }: { request: Request }) {
	try {
		// Require MODERATOR or higher role (checks session, DB, ban, and role)
		await requireRole(request, 'MODERATOR');

		const stats = await getDashboardStats();

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		// If error is already a Response (from requireRole), return it
		if (error instanceof Response) {
			return error;
		}

		console.error('Error fetching admin stats:', error);
		return new Response(JSON.stringify({ 
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}