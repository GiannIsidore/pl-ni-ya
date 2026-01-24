# Project Likha - Development Roadmap

> A comprehensive, phased development plan for building a secure, fast, and feature-rich blog platform.

**Stack:** Astro + Prisma + MySQL + TailwindCSS

---

## Current State Analysis

### ✅ What's Already Built
- Basic Astro project setup with TailwindCSS v4
- Homepage with Hero, AboutUs, and Blogs sections (placeholder data)
- `/blogs` page listing all blogs from database
- Prisma schema with basic `Blog` model
- Navigation component with placeholder links
- Layout component with SEO meta tags
- 6 seed blog posts in database

### ❌ What's Missing
- Individual blog post page (`/blogs/[slug]`)
- Authentication system
- Admin panel for content management
- Search & filtering functionality
- Categories and tags system
- Comments system
- User profiles
- Forums, Ideas, Projects pages (nav links exist but no pages)
- Image upload functionality
- RSS feed
- Sitemap generation
- Mobile navigation (hamburger menu)

---

## Phase 1: Core Blog Functionality
**Duration:** 1-2 weeks | **Priority:** Critical

### 1.1 Individual Blog Post Page
- [ ] Create `/blogs/[slug].astro` dynamic route
- [ ] Display full blog content with rich formatting
- [ ] Implement reading time calculation
- [ ] Add view count increment on page visit
- [ ] Create related posts section
- [ ] Add social sharing buttons
- [ ] Implement breadcrumb navigation

### 1.2 Homepage Blog Integration
- [ ] Replace placeholder data in `Blogs.astro` with real database fetch
- [ ] Limit to 3-6 featured/latest posts
- [ ] Add "View All" link to full blogs page

### 1.3 Categories & Tags System
- [ ] Extend Prisma schema:
  ```prisma
  model Category {
    id    Int    @id @default(autoincrement())
    name  String @unique
    slug  String @unique
    blogs Blog[]
  }

  model Tag {
    id    Int    @id @default(autoincrement())
    name  String @unique
    slug  String @unique
    blogs BlogTag[]
  }

  model BlogTag {
    blogId Int
    tagId  Int
    blog   Blog @relation(fields: [blogId], references: [id])
    tag    Tag  @relation(fields: [tagId], references: [id])
    @@id([blogId, tagId]) 
  }
  ```
- [ ] Create category and tag pages
- [ ] Add filtering by category/tag on blogs page

### 1.4 Search Functionality
- [ ] Implement search API endpoint
- [ ] Add search bar component to navigation
- [ ] Create search results page
- [ ] Implement full-text search via MySQL FULLTEXT index

### 1.5 Pagination
- [ ] Add pagination to blogs listing page
- [ ] Implement infinite scroll or "Load More" pattern (optional)

---

## Phase 2: User Authentication & Profiles
**Duration:** 2-3 weeks | **Priority:** High

### 2.1 Authentication System
- [ ] Choose auth strategy (options):
  - **Lucia Auth** (recommended for Astro)
  - **Better Auth**
  - **Custom JWT-based auth**
- [ ] Extend Prisma schema:
  ```prisma
  model User {
    id            String   @id @default(cuid())
    email         String   @unique
    username      String   @unique
    passwordHash  String
    displayName   String?
    avatar        String?
    bio           String?  @db.Text
    role          Role     @default(USER)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    sessions      Session[]
    blogs         Blog[]   @relation("author")
    comments      Comment[]
  }

  model Session {
    id        String   @id
    userId    String
    expiresAt DateTime
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  enum Role {
    USER
    AUTHOR
    ADMIN
  }
  ```
- [ ] Create authentication pages:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
- [ ] Implement session management
- [ ] Add protected route middleware

### 2.2 User Profiles
- [ ] Create `/users/[username]` profile page
- [ ] Display user's authored posts (if author)
- [ ] Display user's comments
- [ ] Profile settings page (`/settings`)
- [ ] Avatar upload functionality

### 2.3 Security Hardening
- [ ] Password hashing with Argon2 or bcrypt
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] Secure cookie configuration
- [ ] Environment variable validation

---

## Phase 3: Admin Panel & Content Management
**Duration:** 2-3 weeks | **Priority:** High

### 3.1 Admin Dashboard
- [ ] Create `/admin` route with role-based access
- [ ] Dashboard overview page with stats:
  - Total posts, views, users, comments
  - Recent activity
  - Quick actions

### 3.2 Blog Management
- [ ] Create/Edit/Delete blog posts
- [ ] Rich text editor integration (options):
  - **Tiptap** (recommended)
  - **Lexical**
  - **EditorJS**
- [ ] Draft/Publish workflow
- [ ] Schedule posts for future publishing
- [ ] Image upload to cloud storage (Cloudinary/S3/Supabase Storage)
- [ ] SEO metadata editor per post
- [ ] Category/Tag management

### 3.3 User Management
- [ ] View all users
- [ ] Change user roles
- [ ] Ban/Suspend users
- [ ] Delete users

### 3.4 Media Library
- [ ] Upload and manage images
- [ ] Automatic image optimization
- [ ] Image gallery for insertion into posts

---

## Phase 4: Comments System
**Duration:** 1-2 weeks | **Priority:** Medium

### 4.1 Basic Comments
- [ ] Extend Prisma schema:
  ```prisma
  model Comment {
    id        Int       @id @default(autoincrement())
    content   String    @db.Text
    authorId  String
    blogId    Int
    parentId  Int?
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
    author    User      @relation(fields: [authorId], references: [id])
    blog      Blog      @relation(fields: [blogId], references: [id])
    parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
    replies   Comment[] @relation("CommentReplies")
  }
  ```
- [ ] Add comment form on blog post page
- [ ] Display threaded comments
- [ ] Edit/Delete own comments
- [ ] Admin moderation capabilities

### 4.2 Comment Moderation
- [ ] Comment approval workflow (optional)
- [ ] Spam detection
- [ ] Report comment functionality

---

## Phase 5: Forums Feature
**Duration:** 2-3 weeks | **Priority:** Medium

### 5.1 Forum Structure
- [ ] Create Prisma models:
  ```prisma
  model ForumCategory {
    id          Int           @id @default(autoincrement())
    name        String
    description String?
    slug        String        @unique
    topics      ForumTopic[]
  }

  model ForumTopic {
    id          Int           @id @default(autoincrement())
    title       String
    slug        String        @unique
    content     String        @db.Text
    authorId    String
    categoryId  Int
    isPinned    Boolean       @default(false)
    isLocked    Boolean       @default(false)
    views       Int           @default(0)
    createdAt   DateTime      @default(now())
    updatedAt   DateTime      @updatedAt
    author      User          @relation(fields: [authorId], references: [id])
    category    ForumCategory @relation(fields: [categoryId], references: [id])
    replies     ForumReply[]
  }

  model ForumReply {
    id        Int        @id @default(autoincrement())
    content   String     @db.Text
    authorId  String
    topicId   Int
    createdAt DateTime   @default(now())
    updatedAt DateTime   @updatedAt
    author    User       @relation(fields: [authorId], references: [id])
    topic     ForumTopic @relation(fields: [topicId], references: [id])
  }
  ```

### 5.2 Forum Pages
- [ ] `/forums` - List all categories
- [ ] `/forums/[category]` - List topics in category
- [ ] `/forums/[category]/[topic]` - View topic and replies
- [ ] Create new topic form
- [ ] Reply to topic

---

## Phase 6: Ideas & Projects Showcase
**Duration:** 1-2 weeks | **Priority:** Low

### 6.1 Ideas Feature
- [ ] Create Ideas model in Prisma
- [ ] Idea submission form
- [ ] Voting/upvote system
- [ ] Status tracking (submitted, in-progress, completed)
- [ ] `/ideas` listing page

### 6.2 Projects Showcase
- [ ] Create Projects model in Prisma
- [ ] Project submission (by admins/authors)
- [ ] Project detail page with:
  - Description
  - Tech stack
  - Live demo link
  - GitHub link
  - Contributors
- [ ] `/projects` gallery page

---

## Phase 7: SEO & Performance Optimization
**Duration:** 1 week | **Priority:** High

### 7.1 SEO Enhancements
- [ ] Generate sitemap.xml
- [ ] Generate robots.txt
- [ ] Add JSON-LD structured data
- [ ] OpenGraph and Twitter card meta tags (per page)
- [ ] Canonical URLs
- [ ] Meta description per page

### 7.2 Performance
- [ ] Enable Astro's static generation where possible
- [ ] Image optimization (WebP, AVIF conversion)
- [ ] Lazy loading images
- [ ] Code splitting
- [ ] Caching headers configuration
- [ ] Database query optimization with indexes
- [ ] Consider edge caching/CDN integration

### 7.3 Analytics & Monitoring
- [ ] Add analytics integration (Plausible, Umami, or Google Analytics)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## Phase 8: Mobile & UX Improvements
**Duration:** 1 week | **Priority:** Medium

### 8.1 Mobile Navigation
- [ ] Implement hamburger menu for mobile
- [ ] Smooth slide-out navigation drawer
- [ ] Touch-friendly tap targets

### 8.2 UI/UX Enhancements
- [ ] Add loading states and skeletons
- [ ] Toast notifications for actions
- [ ] Dark/Light mode toggle
- [ ] Scroll-to-top button
- [ ] Keyboard navigation support
- [ ] Focus management for accessibility
- [ ] ARIA labels and semantic HTML

### 8.3 Footer Component
- [ ] Create footer with:
  - Newsletter signup
  - Social links
  - Quick links
  - Copyright

---

## Phase 9: Newsletter & Notifications
**Duration:** 1 week | **Priority:** Low

### 9.1 Newsletter
- [ ] Newsletter signup form
- [ ] Email collection in database
- [ ] Integration with email service (Resend, SendGrid, Mailchimp)
- [ ] Double opt-in confirmation

### 9.2 Notifications
- [ ] Email notifications for:
  - New comments on your posts
  - Replies to your comments
  - New forum replies
- [ ] User notification preferences

---

## Phase 10: RSS & API
**Duration:** 1 week | **Priority:** Low

### 10.1 RSS Feed
- [ ] Generate `/rss.xml` feed for blog posts
- [ ] Category-specific RSS feeds

### 10.2 Public API (Optional)
- [ ] REST API for blog posts
- [ ] API rate limiting
- [ ] API documentation

---

## Technical Debt & Maintenance

### Ongoing Tasks
- [ ] Set up CI/CD pipeline
- [ ] Add unit tests for critical functions
- [ ] Add integration tests
- [ ] Set up staging environment
- [ ] Database backup strategy
- [ ] Documentation for contributors
- [ ] Code review guidelines

---

## Quick Wins (Can Do Anytime)
- [ ] Fix Nav component mobile responsiveness
- [ ] Add favicon and app icons
- [ ] Configure proper 404 page
- [ ] Add loading spinner component
- [ ] Improve error pages

---

## Recommended Implementation Order

1. **Start Here:** Phase 1 (Core Blog → individual post page is critical)
2. **Then:** Phase 7.1 (Basic SEO)
3. **Then:** Phase 2 (Authentication)
4. **Then:** Phase 3 (Admin Panel)
5. **Then:** Phase 4 (Comments)
6. **Then:** Phase 8 (Mobile & UX)
7. **Later:** Phase 5, 6, 9, 10 (Features expansion)

---

## Dependencies & Tools to Add

| Feature | Recommended Package |
|---------|---------------------|
| Auth | `lucia` or `better-auth` |
| Rich Text Editor | `tiptap` or `@editorjs/editorjs` |
| Image Upload | `@uppy/core` + Cloudinary/S3 |
| Email | `resend` or `@sendgrid/mail` |
| Markdown | `marked` or `@astrojs/markdown-remark` |
| Search | MySQL FULLTEXT or `algolia` |
| Analytics | `plausible` (self-hosted) or `umami` |

---

*Last Updated: January 20, 2026*
