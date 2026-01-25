import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		// Check if user is authenticated and has admin/moderator role
		const user = (locals as any).user;
		if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
			return new Response(
				JSON.stringify({ message: 'Unauthorized. Admin access required.' }),
				{ status: 401, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const body = await request.json();
		const { title, excerpt, content, tags, status } = body;

		// Validate required fields
		if (!title || !content) {
			return new Response(
				JSON.stringify({ message: 'Title and content are required.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Check if slug already exists
		const existingBlog = await prisma.blog.findUnique({
			where: { slug }
		});

		if (existingBlog) {
			// Add timestamp to make slug unique
			const timestamp = Date.now();
			const uniqueSlug = `${slug}-${timestamp}`;

			// Create blog with unique slug
			const blog = await prisma.blog.create({
				data: {
					title,
					slug: uniqueSlug,
					excerpt: excerpt || '',
					content,
					authorId: user.id,
					status: (status?.toUpperCase() as any) || 'DRAFT',
					tags: tags ? {
						create: tags.map((tagName: string) => ({
							tag: {
								connectOrCreate: {
									where: { name: tagName },
									create: {
										name: tagName,
										slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
									}
								}
							}
						}))
					} : undefined
				},
				include: {
					tags: {
						include: {
							tag: true
						}
					},
					author: {
						select: {
							id: true,
							username: true,
							name: true,
							avatar: true
						}
					}
				}
			});

			return new Response(
				JSON.stringify({
					message: 'Blog created successfully!',
					blog
				}),
				{ status: 201, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Create blog with original slug
		const blog = await prisma.blog.create({
			data: {
				title,
				slug,
				excerpt: excerpt || '',
				content,
				authorId: user.id,
				status: (status?.toUpperCase() as any) || 'DRAFT',
				tags: tags ? {
					create: tags.map((tagName: string) => ({
						tag: {
							connectOrCreate: {
								where: { name: tagName },
								create: {
									name: tagName,
									slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
								}
							}
						}
					}))
				} : undefined
			},
			include: {
				tags: {
					include: {
						tag: true
					}
				},
				author: {
					select: {
						id: true,
						username: true,
						name: true,
						avatar: true
					}
				}
			}
		});

		return new Response(
			JSON.stringify({
				message: 'Blog created successfully!',
				blog
			}),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		);

	} catch (error) {
		console.error('Error creating blog:', error);
		return new Response(
			JSON.stringify({
				message: 'Internal server error',
				error: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export const GET: APIRoute = async ({ locals }) => {
	try {
		// Check if user is authenticated and has admin/moderator role
		const user = (locals as any).user;
		if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
			return new Response(
				JSON.stringify({ message: 'Unauthorized. Admin access required.' }),
				{ status: 401, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Get all blogs for admin management
		const blogs = await prisma.blog.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				tags: {
					include: {
						tag: true
					}
				},
				author: {
					select: {
						id: true,
						username: true,
						name: true,
						avatar: true
					}
				}
			}
		});

		return new Response(
			JSON.stringify({ blogs }),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);

	} catch (error) {
		console.error('Error fetching blogs:', error);
		return new Response(
			JSON.stringify({
				message: 'Internal server error',
				error: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};