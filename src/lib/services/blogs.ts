import prisma from '../prisma';
import type { blog_status, Prisma } from '@prisma/client';

export interface GetBlogsOptions {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    categoryId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface BlogsResult {
    blogs: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export async function getBlogs({
    page = 1,
    limit = 10,
    status,
    search,
    categoryId,
    sortBy = 'createdAt',
    sortOrder = 'desc'
}: GetBlogsOptions): Promise<BlogsResult> {
    const skip = (page - 1) * limit;

    const where: Prisma.blogWhereInput = {};

    // Filter by status if provided
    if (status && status !== 'all') {
        where.status = status.toUpperCase() as blog_status;
    }

    // Filter by category if provided
    if (categoryId) {
        where.categoryId = categoryId;
    }

    // Filter by search query
    if (search) {
        where.OR = [
            { title: { contains: search } }, // Case-insensitive handled by DB collation usually, or use mode: 'insensitive' for Postgres (MySQL is case-insensitive by default)
            { excerpt: { contains: search } },
            { user: {
                OR: [
                    { name: { contains: search } },
                    { username: { contains: search } }
                ]
            }}
        ];
    }

    // Get total count for pagination
    const total = await prisma.blog.count({ where });

    // Get blogs
    const blogs = await prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                }
            },
            category: true,
            image_blog_featuredImageIdToimage: true
        }
    });

    return {
        blogs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}


export async function getBlogById(id: number) {
    return prisma.blog.findUnique({
        where: { id },
        include: {
            blogtag: {
                include: {
                    tag: true
                }
            },
            image_blog_featuredImageIdToimage: true
        }
    });
}
