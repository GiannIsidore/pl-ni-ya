import prisma from '../prisma';
import type { Prisma } from '@prisma/client';

export interface GetCategoriesOptions {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CategoriesResult {
    categories: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CategoryInput {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
}

/**
 * Get paginated list of categories with blog count
 */
export async function getCategories({
    page = 1,
    limit = 10,
    search,
    sortBy = 'name',
    sortOrder = 'asc'
}: GetCategoriesOptions): Promise<CategoriesResult> {
    const skip = (page - 1) * limit;

    const where: Prisma.categoryWhereInput = {};

    // Filter by search query
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } }
        ];
    }

    // Get total count for pagination
    const total = await prisma.category.count({ where });

    // Get categories with blog count
    const categories = await prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: {
                select: {
                    blog: true
                }
            }
        }
    });

    return {
        categories: categories.map((cat: any) => ({
            ...cat,
            blogCount: cat._count.blog
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

/**
 * Get all categories (for dropdowns/filters)
 */
export async function getAllCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { blog: true }
            }
        }
    });
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { blog: true }
            }
        }
    });
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        include: {
            _count: {
                select: { blog: true }
            }
        }
    });
}

/**
 * Create a new category
 */
export async function createCategory(data: CategoryInput) {
    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
        where: { slug: data.slug }
    });

    if (existing) {
        throw new Error('A category with this slug already exists');
    }

    // Check for duplicate name
    const existingName = await prisma.category.findUnique({
        where: { name: data.name }
    });

    if (existingName) {
        throw new Error('A category with this name already exists');
    }

    return prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            icon: data.icon
        }
    });
}

/**
 * Update an existing category
 */
export async function updateCategory(id: number, data: Partial<CategoryInput>) {
    const category = await prisma.category.findUnique({
        where: { id }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    // Check for duplicate slug if changing slug
    if (data.slug && data.slug !== category.slug) {
        const existing = await prisma.category.findUnique({
            where: { slug: data.slug }
        });

        if (existing) {
            throw new Error('A category with this slug already exists');
        }
    }

    // Check for duplicate name if changing name
    if (data.name && data.name !== category.name) {
        const existingName = await prisma.category.findUnique({
            where: { name: data.name }
        });

        if (existingName) {
            throw new Error('A category with this name already exists');
        }
    }

    return prisma.category.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.slug && { slug: data.slug }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.icon !== undefined && { icon: data.icon })
        }
    });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { blog: true }
            }
        }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    if (category._count.blog > 0) {
        throw new Error(`Cannot delete category: ${category._count.blog} blog(s) are using this category. Please reassign or delete those blogs first.`);
    }

    return prisma.category.delete({
        where: { id }
    });
}

/**
 * Generate a slug from a name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
