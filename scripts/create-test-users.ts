import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

// Simple password hashing (Better Auth compatible)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function createTestUsers() {
  console.log("🔑 Creating test users with passwords...");

  const testUsers = [
    {
      id: "test_user_1",
      username: "testuser",
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    },
    {
      id: "test_user_2",
      username: "demo",
      email: "demo@example.com",
      name: "Demo User",
      password: "demo123",
    },
    {
      id: "test_user_3",
      username: "alice",
      email: "alice@example.com",
      name: "Alice Johnson",
      password: "alice123",
    },
  ];

  for (const userData of testUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  User ${userData.username} already exists, skipping...`);
      continue;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        emailVerified: true,
        name: userData.name,
      },
    });

    // Create account with hashed password
    await prisma.account.create({
      data: {
        id: `account_${userData.id}`,
        accountId: userData.email,
        providerId: "credential",
        userId: user.id,
        password: hashPassword(userData.password),
      },
    });

    console.log(`✅ Created user: ${userData.username} (password: ${userData.password})`);
  }

  console.log("\n📋 Test Users Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  testUsers.forEach((u) => {
    console.log(`Username: ${u.username.padEnd(12)} | Email: ${u.email.padEnd(20)} | Password: ${u.password}`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

createTestUsers()
  .catch((e) => {
    console.error("❌ Failed to create test users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
