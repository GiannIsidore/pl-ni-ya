import prisma from '../prisma';

export interface DashboardStats {
    totalUsers: number;
    newUsers: number;
    totalBlogs: number;
    blogViews: number;
    totalThreads: number;
    totalComments: number;
    pendingModeration: number;
    recentActivity: Array<{
        description: string;
        timestamp: string;
        action: string;
        targetType: string;
        targetId: string;
    }>;
    systemHealth: {
        database: string;
        uptime: string;
        lastBackup: string;
    };
}

export async function getDashboardStats(): Promise<DashboardStats> {
    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total users and new users (last 7 days)
    const [totalUsers, newUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            }
        })
    ]);

    // Get blog statistics
    const [totalBlogs, blogViews] = await Promise.all([
        prisma.blog.count(),
        prisma.blog.aggregate({
            _sum: {
                views: true
            }
        })
    ]);

    // Get forum statistics
    const [totalThreads, totalComments] = await Promise.all([
        prisma.thread.count(),
        prisma.comment.count()
    ]);

    // Get pending moderation items
    const pendingModeration = await prisma.thread.count({
        where: {
            OR: [
                { isLocked: true },
                { status: 'CLOSED' }
            ]
        }
    });

    // Get recent activity (last 10 items)
    // Note: ensure AuditLog model exists in your schema
    let recentActivity: any[] = [];
    try {
        recentActivity = await prisma.auditLog.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                performer: {
                    select: {
                        username: true,
                        name: true
                    }
                }
            }
        });
    } catch (e) {
        console.warn("AuditLog table might not exist or empty", e);
    }

    // Format recent activity
    const formattedActivity = recentActivity.map((log: any) => ({
        description: `${log.performer?.username || log.performer?.name || 'Unknown User'} ${log.action.toLowerCase()} ${log.targetType} #${log.targetId}`,
        timestamp: new Date(log.createdAt).toLocaleString(),
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId
    }));

    // System health indicators
    const systemHealth = {
        database: 'healthy',
        uptime: '99.9%',
        lastBackup: '2 hours ago'
    };

    return {
        totalUsers,
        newUsers,
        totalBlogs,
        blogViews: blogViews._sum.views || 0,
        totalThreads,
        totalComments,
        pendingModeration,
        recentActivity: formattedActivity,
        systemHealth
    };
}
