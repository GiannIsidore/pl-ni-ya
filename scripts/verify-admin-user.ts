import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        isBanned: true,
        createdAt: true,
      }
    });

    console.log('🎯 Found Admin Users:');
    adminUsers.forEach(user => {
      console.log('------------------------');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Username: ${user.username}`);
      console.log(`🔐 Role: ${user.role}`);
      console.log(`✅ Email Verified: ${user.emailVerified}`);
      console.log(`🚫 Is Banned: ${user.isBanned}`);
      console.log(`📅 Created: ${user.createdAt}`);
    });

    const targetUser = adminUsers.find(u => u.email === 'admin@pl-niya.com');
    if (targetUser) {
      console.log('\n✅ SUCCESS: Admin user created successfully!');
      console.log('🔗 Admin Panel: http://localhost:4323/admin');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@pl-niya.com');
      console.log('   Username: admin');
      console.log('   Role: ADMIN');
      console.log('\n💡 You can now log in with these credentials to access the admin dashboard.');
    } else {
      console.log('\n❌ ERROR: Target admin user not found in database.');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();