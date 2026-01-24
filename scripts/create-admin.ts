import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // First, create a user with admin role
    const user = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {
        role: 'ADMIN',
        name: 'Admin User',
        username: 'admin',
      },
      create: {
        id: 'admin-test-id',
        email: 'admin@test.com',
        name: 'Admin User',
        username: 'admin',
        role: 'ADMIN',
        emailVerified: true,
      }
    });

    console.log('Admin user created/updated:', user);
    
    // Create some sample data for testing
    const testBlog = await prisma.blog.create({
      data: {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        excerpt: 'This is a test blog post for admin dashboard testing',
        content: 'This is the full content of the test blog post.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readTime: 2,
        authorId: user.id,
      }
    });

    console.log('Test blog created:', testBlog);

    const testThread = await prisma.thread.create({
      data: {
        title: 'Test Thread',
        slug: 'test-thread',
        content: 'This is a test thread for admin dashboard testing',
        forumId: 1, // Assuming forum with ID 1 exists
        authorId: user.id,
        status: 'OPEN',
      }
    });

    console.log('Test thread created:', testThread);

    // Create an audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        action: 'CREATE_ADMIN_USER',
        targetType: 'User',
        targetId: user.id,
        performedBy: user.id,
        details: JSON.stringify({ message: 'Admin user created for testing' }),
        ipAddress: '127.0.0.1',
      }
    });

    console.log('Audit log created:', auditLog);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();