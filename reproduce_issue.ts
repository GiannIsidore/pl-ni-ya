
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
// import { PrismaMariaDb } from '@prisma/adapter-mariadb'; // Trying without adapter first if possible, or mocking it.

// Check if we can just use the standard connection string
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

// Just use default Prisma Client for simplicity if possible, 
// but since the project is configured for adapter, we might need it.
// Let's try to import the existing prisma instance from lib.
// If that fails, we construct it manually.

// Actually, importing from src/lib/prisma is better if it works.
import prisma from './src/lib/prisma';

async function main() {
  try {
    // 1. Create a user to be the author (if one doesn't exist)
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: 'test-user-id',
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            }
        });
        console.log('Created test user:', user.id);
    } else {
        console.log('Using existing user:', user.id);
    }

    // 2. Create an image to be the featured image
    const image = await prisma.image.create({
        data: {
            url: 'http://example.com/image.jpg',
            // blogId: null // Removed explicit null to let it be undefined/null by default
        }
    });
    console.log('Created test image:', image.id);

    // 3. Attempt to create the blog
    const title = 'Test Blog ' + Date.now();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const featuredImageId = image.id;

    console.log('Attempting to create blog with MIXED (Corrected)...');
    try {
         const blog3 = await prisma.blog.create({
            data: {
                title: title + "-3",
                slug: slug + "-3",
                excerpt: 'Test excerpt',
                content: 'Test content',
                authorId: user.id, // Forces Unchecked
                status: 'DRAFT',
                featuredImageId: featuredImageId, // Use SCALAR
                image: { // Use RELATION for list
                    connect: {
                        id: featuredImageId
                    }
                }
            }
        });
        console.log('Blog 3 created successfully:', blog3.id);
    } catch (e) {
        console.log('Failed to create blog 3:', e);
    }

  } catch (error) {
    console.error('Error creating blog:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
