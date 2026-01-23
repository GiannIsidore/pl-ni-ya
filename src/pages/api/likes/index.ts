import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

// POST /api/likes - Toggle like on a thread or comment
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, threadId, commentId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!threadId && !commentId) {
      return new Response(
        JSON.stringify({ error: 'Either threadId or commentId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (threadId && commentId) {
      return new Response(
        JSON.stringify({ error: 'Cannot like both thread and comment at once' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        ...(threadId ? { threadId: parseInt(threadId) } : {}),
        ...(commentId ? { commentId: parseInt(commentId) } : {}),
      },
    });

    if (existingLike) {
      // Unlike - remove the existing like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return new Response(
        JSON.stringify({ 
          action: 'unliked',
          message: 'Like removed successfully' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Like - create new like
      const like = await prisma.like.create({
        data: {
          userId: parseInt(userId),
          ...(threadId ? { threadId: parseInt(threadId) } : {}),
          ...(commentId ? { commentId: parseInt(commentId) } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      return new Response(
        JSON.stringify({ 
          action: 'liked',
          like,
          message: 'Liked successfully' 
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Like error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process like' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GET /api/likes?threadId=X or ?commentId=X - Get likes for a thread or comment
export const GET: APIRoute = async ({ url }) => {
  try {
    const threadId = url.searchParams.get('threadId');
    const commentId = url.searchParams.get('commentId');
    const userId = url.searchParams.get('userId');

    if (!threadId && !commentId) {
      return new Response(
        JSON.stringify({ error: 'Either threadId or commentId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const likes = await prisma.like.findMany({
      where: {
        ...(threadId ? { threadId: parseInt(threadId) } : {}),
        ...(commentId ? { commentId: parseInt(commentId) } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if current user has liked
    let hasLiked = false;
    if (userId) {
      hasLiked = likes.some(like => like.userId === parseInt(userId));
    }

    // Format "who liked" display
    const likeCount = likes.length;
    const firstThree = likes.slice(0, 3).map(like => like.user.username);
    const remaining = likeCount - 3;

    let likedByText = '';
    if (likeCount === 0) {
      likedByText = '';
    } else if (likeCount === 1) {
      likedByText = firstThree[0];
    } else if (likeCount === 2) {
      likedByText = `${firstThree[0]} and ${firstThree[1]}`;
    } else if (likeCount === 3) {
      likedByText = `${firstThree[0]}, ${firstThree[1]}, and ${firstThree[2]}`;
    } else {
      likedByText = `${firstThree[0]}, ${firstThree[1]}, ${firstThree[2]}, and ${remaining} other${remaining > 1 ? 's' : ''}`;
    }

    return new Response(
      JSON.stringify({
        likes,
        likeCount,
        likedByText,
        hasLiked,
        users: likes.map(like => like.user),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Get likes error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get likes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
