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
		const { title, excerpt, content, tags, status, featuredImageId: rawFeaturedImageId } = body;

		// Validate required fields
		if (!title || !content) {
			return new Response(
				JSON.stringify({ message: 'Title and content are required.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Ensure featuredImageId is a valid number if provided
		const featuredImageId = rawFeaturedImageId ? parseInt(String(rawFeaturedImageId)) : undefined;
		const isFeaturedImageIdValid = featuredImageId !== undefined && !isNaN(featuredImageId);

		// Generate slug from title
		let slug = title
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
			slug = `${slug}-${timestamp}`;
		}

		// Prepare tags data
		const tagsData = tags && Array.isArray(tags) ? {
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
		} : undefined;

		// Create blog
		const blog = await prisma.blog.create({
			data: {
				title,
				slug,
				excerpt: excerpt || '',
				content,
				author: {
					connect: { id: user.id }
				},
				status: (status?.toUpperCase() as any) || 'DRAFT',
				tags: tagsData,
				// Set the featured image
				featuredImage: isFeaturedImageIdValid ? {
					connect: { id: featuredImageId }
				} : undefined,
				// Also add it to the general image collection for this blog
				image: isFeaturedImageIdValid ? {
					connect: [{ id: featuredImageId }]
				} : undefined
			},
			include: {
				featuredImage: true,
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

	} catch (error: any) {
		console.error('Error creating blog:', error);

		// Map specific Prisma errors to user-friendly messages
		let errorMessage = 'An error occurred while creating the blog.';
		if (error.code === 'P2002') {
			errorMessage = 'A blog with this title or slug already exists.';
		} else if (error.code === 'P2025') {
			errorMessage = 'One or more referenced records (like the image) were not found.';
		}

		return new Response(
			JSON.stringify({
				message: 'Internal server error',
				error: errorMessage,
				details: error.message
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
				featuredImage: true,
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