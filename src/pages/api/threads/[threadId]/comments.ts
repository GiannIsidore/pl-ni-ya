import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const threadId = parseInt(params.threadId!);
    const body = await request.json();
    const { content, authorId, parentId } = body;

    if (!content || !authorId) {
      return new Response(
        JSON.stringify({ error: 'Content and authorId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return new Response(
        JSON.stringify({ error: 'Thread not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
      });

      if (!parent) {
        return new Response(
          JSON.stringify({ error: 'Parent comment not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        threadId,
        authorId: parseInt(authorId),
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        author: true,
        parent: true,
      },
    });

    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
