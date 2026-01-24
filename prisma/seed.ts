import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (respecting foreign key constraints)
  console.log("🧹 Clearing existing data...");
  await prisma.image.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  console.log("👤 Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "user_1",
        username: "admin",
        email: "admin@example.com",
        emailVerified: true,
        name: "Admin User",
      },
    }),
    prisma.user.create({
      data: {
        id: "user_2",
        username: "john_doe",
        email: "john@example.com",
        emailVerified: true,
        name: "John Doe",
      },
    }),
    prisma.user.create({
      data: {
        id: "user_3",
        username: "jane_smith",
        email: "jane@example.com",
        emailVerified: true,
        name: "Jane Smith",
      },
    }),
    prisma.user.create({
      data: {
        id: "user_4",
        username: "tech_enthusiast",
        email: "tech@example.com",
        emailVerified: true,
        name: "Tech Enthusiast",
      },
    }),
    prisma.user.create({
      data: {
        id: "user_5",
        username: "web_dev_master",
        email: "webdev@example.com",
        emailVerified: true,
        name: "Web Dev Master",
      },
    }),
  ]);

  // Create sample blogs
  console.log("📝 Creating blogs...");
  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        slug: "getting-started-with-prisma",
        title: "Getting Started with Prisma ORM",
        excerpt:
          "Learn how to set up and use Prisma ORM in your next project. This comprehensive guide covers everything from installation to advanced queries.",
        content: `Prisma is a next-generation ORM that makes database access easy and type-safe. In this article, we'll explore how to get started with Prisma, set up your first schema, and perform common database operations. Whether you're building a REST API or a full-stack application, Prisma provides the tools you need to work with your database efficiently.

We'll cover:
- Installing Prisma and setting up your project
- Creating your first schema
- Running migrations
- Querying data with Prisma Client
- Best practices and common patterns`,
        views: 1250,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "modern-web-development-trends",
        title: "Modern Web Development Trends in 2025",
        excerpt:
          "Explore the latest trends shaping web development in 2025, from serverless architectures to AI-powered tools and frameworks.",
        content: `The web development landscape is constantly evolving. In 2025, we're seeing exciting trends like serverless computing, edge functions, AI-assisted development, and new frameworks that prioritize developer experience.

Key trends include:
- Serverless and edge computing
- AI-powered development tools
- Improved TypeScript support
- New frameworks focusing on performance
- Enhanced developer tooling

This article dives deep into the technologies and practices that are defining modern web development.`,
        views: 2840,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "building-scalable-apis",
        title: "Building Scalable APIs with TypeScript",
        excerpt:
          "Discover best practices for building robust, scalable APIs using TypeScript. Learn about error handling, validation, and performance optimization.",
        content: `Building APIs that can scale is crucial for modern applications. In this guide, we'll cover TypeScript patterns for API development, including proper error handling, request validation, rate limiting, and database optimization.

Topics covered:
- TypeScript patterns for API design
- Error handling strategies
- Request validation and sanitization
- Rate limiting and security
- Database query optimization
- Testing strategies
- Deployment considerations

We'll also explore real-world examples and common pitfalls to avoid.`,
        views: 1920,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "astro-framework-guide",
        title: "Complete Guide to Astro Framework",
        excerpt:
          "Learn how to build fast, content-focused websites with Astro. This guide covers components, islands architecture, and deployment strategies.",
        content: `Astro is a modern web framework designed for content-rich websites. It ships zero JavaScript by default, resulting in incredibly fast page loads. In this comprehensive guide, we'll explore Astro's unique features like the islands architecture, component framework support, and how to optimize your site for performance.

What makes Astro special:
- Zero JavaScript by default
- Islands architecture for interactivity
- Support for React, Vue, Svelte, and more
- Built-in optimizations
- Great developer experience

We'll walk through building a complete site with Astro, from setup to deployment.`,
        views: 3420,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "database-design-principles",
        title: "Database Design Principles for Developers",
        excerpt:
          "Master the fundamentals of database design. Learn about normalization, indexing, relationships, and when to break the rules.",
        content: `Good database design is the foundation of any successful application. This article covers essential principles like normalization, indexing strategies, relationship modeling, and performance considerations.

Core concepts:
- Database normalization (1NF, 2NF, 3NF)
- Indexing strategies and when to use them
- Relationship modeling (one-to-one, one-to-many, many-to-many)
- Performance vs. normalization trade-offs
- When to denormalize
- Data integrity constraints
- Query optimization techniques

We'll also discuss when it's appropriate to break the rules and how to balance performance with data integrity.`,
        views: 1680,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "typescript-advanced-patterns",
        title: "Advanced TypeScript Patterns",
        excerpt:
          "Level up your TypeScript skills with advanced patterns including conditional types, mapped types, and utility type combinations.",
        content: `TypeScript's type system is incredibly powerful. Beyond basic types, you can create sophisticated type patterns that catch errors at compile time and improve developer experience. This article explores conditional types, template literal types, mapped types, and how to combine them for maximum type safety.

Advanced topics:
- Conditional types and type inference
- Template literal types
- Mapped types and key remapping
- Utility type combinations
- Branded types for runtime safety
- Type-level programming
- Real-world examples and use cases

Learn how to leverage TypeScript's advanced features to write more robust and maintainable code.`,
        views: 2150,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "react-server-components-deep-dive",
        title: "React Server Components: A Deep Dive",
        excerpt:
          "Understanding React Server Components and how they revolutionize the way we build React applications with improved performance and developer experience.",
        content: `React Server Components represent a paradigm shift in React development. They allow you to build applications that leverage the server for rendering while maintaining the interactive client-side experience we love.

Key benefits:
- Reduced JavaScript bundle size
- Direct database access from components
- Improved performance
- Better SEO
- Simplified data fetching

This deep dive explores the architecture, use cases, and best practices for implementing Server Components in your applications.`,
        views: 3890,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
            },
          ],
        },
      },
    }),
    prisma.blog.create({
      data: {
        slug: "css-modern-layout-techniques",
        title: "Modern CSS Layout Techniques",
        excerpt:
          "Explore Grid, Flexbox, and Container Queries to create responsive, maintainable layouts that work across all devices.",
        content: `Modern CSS provides powerful layout tools that make responsive design easier than ever. This guide covers the latest techniques including CSS Grid, Flexbox, and the new Container Queries feature.

Topics:
- CSS Grid for complex layouts
- Flexbox for component layouts
- Container Queries for component-level responsiveness
- Subgrid for nested layouts
- Logical properties for internationalization
- Modern responsive design patterns

Learn how to combine these techniques to build layouts that are both beautiful and maintainable.`,
        views: 2750,
        image: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
            },
          ],
        },
      },
    }),
  ]);

  // Create sample forums
  console.log("💬 Creating forums...");
  const forums = await Promise.all([
    prisma.forum.create({
      data: {
        name: "General Discussion",
        description:
          "Talk about anything and everything. Share your thoughts, ask questions, and connect with the community.",
        slug: "general-discussion",
      },
    }),
    prisma.forum.create({
      data: {
        name: "Technology",
        description:
          "Discuss the latest in technology, programming, software development, and tech news.",
        slug: "technology",
      },
    }),
    prisma.forum.create({
      data: {
        name: "Web Development",
        description:
          "Share tips, tricks, and resources for web development. HTML, CSS, JavaScript, frameworks, and more.",
        slug: "web-development",
      },
    }),
    prisma.forum.create({
      data: {
        name: "Mobile Networks",
        description:
          "Discussions about mobile networks, carriers, plans, and connectivity.",
        slug: "mobile-networks",
      },
    }),
    prisma.forum.create({
      data: {
        name: "Projects & Ideas",
        description:
          "Share your projects, get feedback, and collaborate with others on exciting ideas.",
        slug: "projects-ideas",
      },
    }),
    prisma.forum.create({
      data: {
        name: "DevOps & Infrastructure",
        description:
          "Discuss deployment, CI/CD, containerization, cloud services, and infrastructure as code.",
        slug: "devops-infrastructure",
      },
    }),
    prisma.forum.create({
      data: {
        name: "Design & UX",
        description:
          "Share design resources, discuss UX principles, and get feedback on your designs.",
        slug: "design-ux",
      },
    }),
  ]);

  // Create sample threads
  console.log("🧵 Creating threads...");
  const threads = await Promise.all([
    // General Discussion threads
    prisma.thread.create({
      data: {
        title: "Welcome to the Community!",
        content: `Hello everyone! Welcome to our community forum. This is a place where we can share ideas, ask questions, and help each other grow.

Feel free to introduce yourself and let us know what brings you here. Whether you're a beginner or an experienced developer, everyone is welcome!`,
        slug: "welcome-to-the-community",
        forumId: forums[0].id,
        authorId: users[0].id,
        views: 450,
      },
    }),
    prisma.thread.create({
      data: {
        title: "What's your favorite programming language?",
        content: `I'm curious to hear what programming languages everyone is using and why. Are you sticking with the classics like JavaScript and Python, or exploring newer languages like Rust or Go?

Share your thoughts and experiences!`,
        slug: "favorite-programming-language",
        forumId: forums[0].id,
        authorId: users[1].id,
        views: 320,
      },
    }),

    // Technology threads
    prisma.thread.create({
      data: {
        title: "AI in Software Development: Hype or Reality?",
        content: `With all the buzz around AI coding assistants, I wanted to start a discussion about their real impact on software development. Are they truly game-changers, or just overhyped tools?

What's your experience been? Have they improved your productivity, or do they create more problems than they solve?`,
        slug: "ai-in-software-development",
        forumId: forums[1].id,
        authorId: users[2].id,
        views: 890,
      },
    }),
    prisma.thread.create({
      data: {
        title: "Best Practices for Code Reviews",
        content: `Code reviews are crucial for maintaining code quality, but they can be tricky to get right. What are your best practices?

I'm particularly interested in:
- How to give constructive feedback
- What to look for in a review
- Balancing thoroughness with speed
- Tools that help streamline the process`,
        slug: "best-practices-code-reviews",
        forumId: forums[1].id,
        authorId: users[3].id,
        views: 670,
      },
    }),

    // Web Development threads
    prisma.thread.create({
      data: {
        title: "React vs Vue vs Svelte: Which Should You Choose?",
        content: `The frontend framework landscape is crowded, and choosing the right one can be overwhelming. Let's discuss the strengths and weaknesses of React, Vue, and Svelte.

Considerations:
- Learning curve
- Ecosystem and community
- Performance
- Developer experience
- Use cases

What's your take?`,
        slug: "react-vs-vue-vs-svelte",
        forumId: forums[2].id,
        authorId: users[4].id,
        views: 1200,
      },
    }),
    prisma.thread.create({
      data: {
        title: "CSS-in-JS vs Utility Classes: The Eternal Debate",
        content: `Another hot topic in web development! Should you use CSS-in-JS solutions like styled-components, or utility-first frameworks like Tailwind CSS?

Both have their merits. Let's discuss when each approach makes sense and share your experiences.`,
        slug: "css-in-js-vs-utility-classes",
        forumId: forums[2].id,
        authorId: users[1].id,
        views: 540,
      },
    }),

    // Mobile Networks threads
    prisma.thread.create({
      data: {
        title: "5G vs 4G: Real-World Performance Comparison",
        content: `I've been testing 5G in my area and the results are mixed. Sometimes it's blazing fast, other times it's barely better than 4G.

Has anyone else noticed this? What's your experience with 5G coverage and performance?`,
        slug: "5g-vs-4g-performance",
        forumId: forums[3].id,
        authorId: users[2].id,
        views: 380,
      },
    }),

    // Projects & Ideas threads
    prisma.thread.create({
      data: {
        title: "Showcase Your Side Projects",
        content: `This is a space to share your side projects, get feedback, and inspire others! Whether it's a web app, mobile app, or something else entirely, we'd love to see what you're building.

Include:
- What it does
- Technologies used
- What you learned
- Link to demo/code (if available)`,
        slug: "showcase-side-projects",
        forumId: forums[4].id,
        authorId: users[0].id,
        views: 210,
      },
    }),
    prisma.thread.create({
      data: {
        title: "Looking for Collaborators: Open Source Project",
        content: `I'm working on an open-source project for managing developer documentation. It's built with TypeScript, React, and Node.js.

Looking for contributors who are interested in:
- Documentation tools
- Developer experience
- Open source collaboration

If you're interested, let me know!`,
        slug: "open-source-collaborators",
        forumId: forums[4].id,
        authorId: users[3].id,
        views: 150,
      },
    }),

    // DevOps threads
    prisma.thread.create({
      data: {
        title: "Docker Best Practices for Production",
        content: `I'm setting up Docker for a production environment and want to make sure I'm following best practices. What are your recommendations?

Topics I'm interested in:
- Image optimization
- Security considerations
- Multi-stage builds
- Orchestration with Docker Compose or Kubernetes`,
        slug: "docker-production-best-practices",
        forumId: forums[5].id,
        authorId: users[4].id,
        views: 420,
      },
    }),

    // Design & UX threads
    prisma.thread.create({
      data: {
        title: "Accessibility: Making the Web Inclusive",
        content: `Accessibility is often overlooked, but it's crucial for creating inclusive web experiences. Let's discuss:

- Common accessibility mistakes
- Tools for testing
- WCAG guidelines
- Real-world examples of good/bad accessibility

Share your experiences and tips!`,
        slug: "accessibility-inclusive-web",
        forumId: forums[6].id,
        authorId: users[1].id,
        views: 290,
      },
    }),
  ]);

  // Create some comments on threads
  console.log("💭 Creating comments...");
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: "Great post! I completely agree with your points about code reviews.",
        threadId: threads[3].id,
        authorId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "I've had a similar experience with 5G. The coverage maps don't always match reality.",
        threadId: threads[6].id,
        authorId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "React has a larger ecosystem, but Vue has better developer experience in my opinion.",
        threadId: threads[4].id,
        authorId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "I prefer Tailwind for rapid prototyping, but CSS-in-JS for component libraries.",
        threadId: threads[5].id,
        authorId: users[3].id,
      },
    }),
  ]);

  // Create nested comment (reply to the previous comment)
  await prisma.comment.create({
    data: {
      content: "That's a good point! I think it depends on the project size and team preferences.",
      threadId: threads[5].id,
      authorId: users[4].id,
      parentId: comments[3].id, // Reply to the Tailwind comment
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`Created ${users.length} users`);
  console.log(`Created ${blogs.length} blogs`);
  console.log(`Created ${forums.length} forums`);
  console.log(`Created ${threads.length} threads`);
  console.log(`Created ${comments.length + 1} comments`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
