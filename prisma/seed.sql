-- Clear existing data (optional)
DELETE FROM Blog;

-- Insert sample blog posts
INSERT INTO Blog (slug, title, excerpt, content, image, views, createdAt, updatedAt) VALUES
(
  'getting-started-with-prisma',
  'Getting Started with Prisma ORM',
  'Learn how to set up and use Prisma ORM in your next project. This comprehensive guide covers everything from installation to advanced queries.',
  'Prisma is a next-generation ORM that makes database access easy and type-safe. In this article, we''ll explore how to get started with Prisma, set up your first schema, and perform common database operations. Whether you''re building a REST API or a full-stack application, Prisma provides the tools you need to work with your database efficiently.

We''ll cover:
- Installing Prisma and setting up your project
- Creating your first schema
- Running migrations
- Querying data with Prisma Client
- Best practices and common patterns',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  1250,
  NOW(),
  NOW()
),
(
  'modern-web-development-trends',
  'Modern Web Development Trends in 2025',
  'Explore the latest trends shaping web development in 2025, from serverless architectures to AI-powered tools and frameworks.',
  'The web development landscape is constantly evolving. In 2025, we''re seeing exciting trends like serverless computing, edge functions, AI-assisted development, and new frameworks that prioritize developer experience.

Key trends include:
- Serverless and edge computing
- AI-powered development tools
- Improved TypeScript support
- New frameworks focusing on performance
- Enhanced developer tooling

This article dives deep into the technologies and practices that are defining modern web development.',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
  2840,
  NOW(),
  NOW()
),
(
  'building-scalable-apis',
  'Building Scalable APIs with TypeScript',
  'Discover best practices for building robust, scalable APIs using TypeScript. Learn about error handling, validation, and performance optimization.',
  'Building APIs that can scale is crucial for modern applications. In this guide, we''ll cover TypeScript patterns for API development, including proper error handling, request validation, rate limiting, and database optimization.

Topics covered:
- TypeScript patterns for API design
- Error handling strategies
- Request validation and sanitization
- Rate limiting and security
- Database query optimization
- Testing strategies
- Deployment considerations

We''ll also explore real-world examples and common pitfalls to avoid.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  1920,
  NOW(),
  NOW()
),
(
  'astro-framework-guide',
  'Complete Guide to Astro Framework',
  'Learn how to build fast, content-focused websites with Astro. This guide covers components, islands architecture, and deployment strategies.',
  'Astro is a modern web framework designed for content-rich websites. It ships zero JavaScript by default, resulting in incredibly fast page loads. In this comprehensive guide, we''ll explore Astro''s unique features like the islands architecture, component framework support, and how to optimize your site for performance.

What makes Astro special:
- Zero JavaScript by default
- Islands architecture for interactivity
- Support for React, Vue, Svelte, and more
- Built-in optimizations
- Great developer experience

We''ll walk through building a complete site with Astro, from setup to deployment.',
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
  3420,
  NOW(),
  NOW()
),
(
  'database-design-principles',
  'Database Design Principles for Developers',
  'Master the fundamentals of database design. Learn about normalization, indexing, relationships, and when to break the rules.',
  'Good database design is the foundation of any successful application. This article covers essential principles like normalization, indexing strategies, relationship modeling, and performance considerations.

Core concepts:
- Database normalization (1NF, 2NF, 3NF)
- Indexing strategies and when to use them
- Relationship modeling (one-to-one, one-to-many, many-to-many)
- Performance vs. normalization trade-offs
- When to denormalize
- Data integrity constraints
- Query optimization techniques

We''ll also discuss when it''s appropriate to break the rules and how to balance performance with data integrity.',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  1680,
  NOW(),
  NOW()
),
(
  'typescript-advanced-patterns',
  'Advanced TypeScript Patterns',
  'Level up your TypeScript skills with advanced patterns including conditional types, mapped types, and utility type combinations.',
  'TypeScript''s type system is incredibly powerful. Beyond basic types, you can create sophisticated type patterns that catch errors at compile time and improve developer experience. This article explores conditional types, template literal types, mapped types, and how to combine them for maximum type safety.

Advanced topics:
- Conditional types and type inference
- Template literal types
- Mapped types and key remapping
- Utility type combinations
- Branded types for runtime safety
- Type-level programming
- Real-world examples and use cases

Learn how to leverage TypeScript''s advanced features to write more robust and maintainable code.',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  2150,
  NOW(),
  NOW()
);
