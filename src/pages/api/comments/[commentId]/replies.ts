import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';
import { requireVerifiedUser } from '../../../../lib/authorization';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Require verified user (checks session, DB existence, and ban status)
    const user = await requireVerifiedUser(request);

    const parentId = parseInt(params.commentId!);
    const body = await request.json();
    const { content, threadId } = body;

    if (!content || !threadId) {
      return new Response(
        JSON.stringify({ error: 'Content and threadId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify parent comment exists
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return new Response(
        JSON.stringify({ error: 'Parent comment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reply = await prisma.comment.create({
      data: {
        content,
        threadId: parseInt(threadId),
        authorId: user.id,
        parentId,
      },
      include: {
        author: true,
        parent: true,
      },
    });

    return new Response(JSON.stringify(reply), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // If error is already a Response (from requireVerifiedUser), return it
    if (error instanceof Response) {
      return error;
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create reply' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
