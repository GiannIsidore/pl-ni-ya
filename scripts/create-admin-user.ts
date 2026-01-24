import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    
    // Create or update admin user
    const user = await prisma.user.upsert({
      where: { email: 'admin@pl-niya.com' },
      update: {
        role: 'ADMIN',
        name: 'Admin User',
        username: 'admin',
        isBanned: false,
      },
      create: {
        id: 'admin-user-001',
        email: 'admin@pl-niya.com',
        name: 'Admin User',
        username: 'admin',
        role: 'ADMIN',
        emailVerified: true,
        isBanned: false,
      }
    });

    console.log('✅ Admin user created/updated:', user);

    // Create sample blog post
    const blog = await prisma.blog.upsert({
      where: { slug: 'admin-test-blog' },
      update: {
        title: 'Admin Test Blog',
        excerpt: 'This is a test blog post created by admin for dashboard testing.',
        content: 'This is the full content of the test blog post created by the admin user.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readTime: 3,
        authorId: user.id,
      },
      create: {
        title: 'Admin Test Blog',
        slug: 'admin-test-blog',
        excerpt: 'This is a test blog post created by admin for dashboard testing.',
        content: 'This is the full content of the test blog post created by the admin user.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readTime: 3,
        authorId: user.id,
      }
    });

    console.log('✅ Test blog created:', blog);

    // Create sample thread
    const thread = await prisma.thread.upsert({
      where: { slug: 'admin-test-thread' },
      update: {
        title: 'Admin Test Thread',
        content: 'This is a test thread created by admin for dashboard testing.',
        forumId: 1,
        status: 'OPEN',
      },
      create: {
        title: 'Admin Test Thread',
        slug: 'admin-test-thread',
        content: 'This is a test thread created by admin for dashboard testing.',
        forumId: 1,
        authorId: user.id,
        status: 'OPEN',
      }
    });

    console.log('✅ Test thread created:', thread);

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        action: 'CREATE_ADMIN_USER',
        targetType: 'User',
        targetId: user.id,
        performedBy: user.id,
        details: JSON.stringify({ 
          message: 'Admin user created with role-based access',
          timestamp: new Date().toISOString()
        }),
        ipAddress: '127.0.0.1',
      }
    });

    console.log('✅ Audit log entry created:', auditLog);

    // Verify user creation
    const verifyUser = await prisma.user.findUnique({
      where: { email: 'admin@pl-niya.com' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
      }
    });

    console.log('✅ Verification - Admin user:', verifyUser);

    console.log('\n🎉 Admin user creation completed successfully!');
    console.log('📧 Email: admin@pl-niya.com');
    console.log('👤 Username: admin');
    console.log('🔐 Role: ADMIN');
    console.log('\n💡 Note: You can now log in with these credentials to access the admin panel at /admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();