import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const threadId = parseInt(params.threadId!);

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: true,
        forum: true,
        comments: {
          where: { parentId: null }, // Only top-level comments
          include: {
            author: true,
            replies: {
              include: {
                author: true,
                replies: {
                  include: {
                    author: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return new Response(
        JSON.stringify({ error: 'Thread not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Increment view count
    await prisma.thread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } },
    });

    return new Response(JSON.stringify(thread), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch thread' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
