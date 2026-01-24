import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';
import { requireVerifiedUser } from '../../../../lib/authorization';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Require verified user (checks session, DB existence, and ban status)
    const user = await requireVerifiedUser(request);

    const threadId = parseInt(params.threadId!);
    const body = await request.json();
    const { content, parentId } = body;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
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
        authorId: user.id,
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
    // If error is already a Response (from requireVerifiedUser), return it
    if (error instanceof Response) {
      return error;
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
