import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

// GET /api/threads/[threadId]/likes - Get all likes for a thread
export const GET: APIRoute = async ({ params, url }) => {
  try {
    const threadId = parseInt(params.threadId!);
    const userId = url.searchParams.get('userId');

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

    const likes = await prisma.like.findMany({
      where: { threadId },
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
        threadId,
        likes,
        likeCount,
        likedByText,
        hasLiked,
        users: likes.map(like => like.user),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Get thread likes error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get likes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
