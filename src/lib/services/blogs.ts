import prisma from '../prisma';
import type { BlogStatus, Prisma } from '@prisma/client';

export interface GetBlogsOptions {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
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
    sortBy = 'createdAt',
    sortOrder = 'desc'
}: GetBlogsOptions): Promise<BlogsResult> {
    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = {};

    // Filter by status if provided
    if (status && status !== 'all') {
        where.status = status.toUpperCase() as BlogStatus;
    }

    // Filter by search query
    if (search) {
        where.OR = [
            { title: { contains: search } }, // Case-insensitive handled by DB collation usually, or use mode: 'insensitive' for Postgres (MySQL is case-insensitive by default)
            { excerpt: { contains: search } },
            { author: { 
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
            author: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                }
            },
            category: true,
            featuredImage: true
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
            tags: {
                include: {
                    tag: true
                }
            },
            featuredImage: true
        }
    });
}
