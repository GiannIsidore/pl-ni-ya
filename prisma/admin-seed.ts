import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
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

    console.log('✅ Admin user created:', adminUser);

    // Create test data
    await Promise.all([
      // Test blog
      prisma.blog.upsert({
        where: { slug: 'admin-test-blog' },
        update: {
          title: 'Admin Test Blog',
          excerpt: 'This is a test blog post created by admin.',
          content: 'This is the full content of the test blog post.',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          readTime: 3,
          authorId: adminUser.id,
        },
        create: {
          title: 'Admin Test Blog',
          slug: 'admin-test-blog',
          excerpt: 'This is a test blog post created by admin.',
          content: 'This is the full content of the test blog post.',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          readTime: 3,
          authorId: adminUser.id,
        }
      }),
      
      // Test thread
      prisma.thread.upsert({
        where: { slug: 'admin-test-thread' },
        update: {
          title: 'Admin Test Thread',
          content: 'This is a test thread created by admin.',
          status: 'OPEN',
        },
        create: {
          title: 'Admin Test Thread',
          slug: 'admin-test-thread',
          content: 'This is a test thread created by admin.',
          forumId: 1,
          authorId: adminUser.id,
          status: 'OPEN',
        }
      }),
      
      // Audit logs
      prisma.auditLog.createMany({
        data: [
          {
            action: 'CREATE_ADMIN_USER',
            targetType: 'User',
            targetId: adminUser.id,
            performedBy: adminUser.id,
            details: JSON.stringify({ message: 'Admin user created for testing', role: 'ADMIN' }),
            ipAddress: '127.0.0.1',
          },
          {
            action: 'LOGIN',
            targetType: 'User',
            targetId: adminUser.id,
            performedBy: adminUser.id,
            details: JSON.stringify({ message: 'Admin logged in successfully' }),
            ipAddress: '127.0.0.1',
          },
          {
            action: 'VIEW_DASHBOARD',
            targetType: 'AdminPanel',
            targetId: 'main',
            performedBy: adminUser.id,
            details: JSON.stringify({ message: 'Admin accessed dashboard' }),
            ipAddress: '127.0.0.1',
          }
        ]
      })
    ]);

    console.log('🎉 Admin user and test data created successfully!');
    console.log('📧 Email: admin@pl-niya.com');
    console.log('👤 Username: admin');
    console.log('🔐 Role: ADMIN');
    console.log('🔗 Admin Panel: http://localhost:4323/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}