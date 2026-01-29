# Blog & Forum Improvements - TO-DO List

> **Goal**: Implement industry-standard features for quick-response, user-friendly blogs and forums with enhanced security, performance, and user experience.

---

## Phase 1: Database Schema Enhancements ✅ COMPLETE

### Blog Schema Updates ✅
- [x] Add `Tag` model with many-to-many relation to `Blog`
- [x] Add `Category` model for organizing blogs
- [x] Update `Blog` model with new fields:
  - [x] `categoryId` - Foreign key to Category
  - [x] `authorId` - Foreign key to User (admin users)
  - [x] `status` - Enum: DRAFT | PUBLISHED | ARCHIVED
  - [x] `isFeatured` - Boolean for featured posts
  - [x] `publishedAt` - DateTime for scheduled publishing
  - [x] `readTime` - Estimated reading time (auto-calculated)

### Forum Schema Updates ✅
- [x] Add `isLocked` field to `Thread` for moderation
- [x] Add `isPinned` field to `Thread` for sticky threads
- [x] Add `status` field to `Thread` - Enum: OPEN | CLOSED | RESOLVED

### User Role Schema Updates ✅
- [x] Add `Role` enum to Prisma schema (USER, MODERATOR, ADMIN)
- [x] Update `User` model with role-related fields (role, isBanned, bannedAt, bannedBy, banReason, bannedUntil)
- [x] Add `AuditLog` model for tracking admin/mod actions

---

## Phase 1.5: Role-Based Access Control (RBAC) 🔄 PARTIAL

### Role Definitions & Permissions ✅
| Permission | USER | MODERATOR | ADMIN |
|------------|:----:|:---------:|:-----:|
| **Blogs** |
| View published blogs | ✅ | ✅ | ✅ |
| Create blog posts | ❌ | ✅ | ✅ |
| Edit own blog posts | ❌ | ✅ | ✅ |
| Edit any blog post | ❌ | ❌ | ✅ |
| Delete any blog post | ❌ | ❌ | ✅ |
| Manage tags/categories | ❌ | ❌ | ✅ |
| **Forums** |
| View forums | ✅ | ✅ | ✅ |
| Create threads | ✅ | ✅ | ✅ |
| Edit own threads | ✅ | ✅ | ✅ |
| Delete own threads | ✅ | ✅ | ✅ |
| Edit any thread | ❌ | ✅ | ✅ |
| Delete any thread | ❌ | ✅ | ✅ |
| Pin/Lock threads | ❌ | ✅ | ✅ |
| Create/Edit comments | ✅ | ✅ | ✅ |
| Delete any comment | ❌ | ✅ | ✅ |
| **User Management** |
| View user profiles | ✅ | ✅ | ✅ |
| Ban/Unban users | ❌ | ✅ | ✅ |
| Set ban duration | ❌ | ✅ | ✅ |
| Manage moderators | ❌ | ❌ | ✅ |
| Manage admins | ❌ | ❌ | ✅ |
| **Admin Panel** |
| Access admin dashboard | ❌ | ✅ | ✅ |
| View analytics | ❌ | ✅ | ✅ |
| System settings | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ✅ | ✅ |

### Authorization Middleware 🔄
- [x] Create `src/lib/permissions.ts` with permission constants
- [x] Create `src/lib/authorization.ts` with role checks
- [x] Update `src/middleware.ts` for authentication
- [ ] Create `src/lib/auth-guard.ts` with requireAuth functions
- [ ] Add ban status checking middleware

### API Route Protection 🔄
- [x] Protect `/api/admin/*` endpoints (Moderator+ only)
- [ ] Protect all `/api/blogs/*` mutation endpoints (Admin only for create/edit/delete)
- [ ] Protect moderation endpoints (Moderator+ only)
- [ ] Protect `/api/users/ban` (Moderator+ only)
- [ ] Protect `/api/users/role` (Admin only)

### User Ban System ❌
- [ ] Create `/api/users/ban.ts` - Ban a user
- [ ] Create `/api/users/unban.ts` - Unban a user
- [ ] Add ban check middleware to all authenticated routes
- [ ] Show ban message with reason and expiration to banned users
- [ ] Auto-unban system for temporary bans

---

## Phase 1.6: Admin Panel (Dashboard) 🔄 PARTIAL

### Admin Layout & Navigation ✅
- [x] Create `/admin` route group with AdminLayout
- [x] Create `AdminSidebar.astro` component
- [x] Role-based menu visibility (Moderators vs Admins)

### Admin Dashboard Pages 🔄

#### Main Dashboard (`/admin/index.astro`) ✅
- [x] Overview statistics cards (users, blogs, threads, pending moderation)
- [x] Quick action buttons
- [x] Recent activity feed
- [x] System health indicators

#### Blog Management (`/admin/blogs/*`) ✅
- [x] `/admin/blogs/index.astro` - Blog listing with filters
- [x] `/admin/blogs/create.astro` - Create new blog
- [x] `/admin/blogs/edit/[id].astro` - Edit blog
- [x] Status filter (Draft/Published/Archived)
- [x] Search by title
- [x] Rich text editor with formatting

#### Category Management (`/admin/categories/*`) ✅
- [x] `/admin/categories/index.astro` - Category listing
- [x] Create/Edit/Delete categories
- [x] Slug auto-generation
- [x] Blog count per category
- [x] Search and pagination

#### Forum Moderation (`/admin/forums/*`) ❌
- [ ] `/admin/forums/index.astro` - Forum overview
- [ ] `/admin/forums/threads.astro` - Thread management
- [ ] `/admin/forums/reported.astro` - Reported content queue

#### User Management (`/admin/users/*`) ❌
- [ ] `/admin/users/index.astro` - User listing
- [ ] `/admin/users/[id].astro` - User detail page
- [ ] `/admin/users/banned.astro` - Banned users list
- [ ] `/admin/users/roles.astro` - Role management (Admin only)

#### Analytics (`/admin/analytics/*`) ❌
- [ ] `/admin/analytics/index.astro` - Dashboard analytics

#### Audit Logs (`/admin/audit-logs.astro`) ❌
- [ ] Searchable audit log table

#### Settings (`/admin/settings.astro`) ❌
- [ ] Site configuration

### Admin API Endpoints 🔄
- [x] `/api/admin/stats.ts` - Dashboard statistics
- [x] `/api/admin/blogs/*` - Blog CRUD operations
- [x] `/api/admin/categories/*` - Category CRUD operations
- [ ] `/api/admin/users/list.ts` - Paginated user list
- [ ] `/api/admin/users/[id]/role.ts` - Change user role
- [ ] `/api/admin/audit-logs.ts` - Fetch audit logs
- [ ] `/api/admin/reports/*` - Handle reported content

---

## Phase 2: Blog Tags System 🔄 PARTIAL

### Admin Tag Management ❌
- [ ] Create `/admin/tags/index.astro` - Tag listing with CRUD operations
- [ ] Create `/api/tags/create.ts` - Create new tags
- [ ] Create `/api/tags/delete.ts` - Delete tags
- [ ] Create `/api/tags/update.ts` - Update tag details

### Blog Tag Assignment 🔄
- [x] Update blog editor to include tag selection UI (basic implementation)
- [x] Update `/api/blogs/create.ts` to handle tag assignment
- [x] Update `/api/blogs/update.ts` to handle tag updates
- [ ] Multi-select dropdown for existing tags
- [ ] Inline tag creation capability
- [ ] Tag chips display with remove option

### Tag Display (Frontend) 🔄
- [x] Add tag chips to blog cards on index page (basic)
- [ ] Add tag section to blog detail page `[slug].astro`
- [ ] Create clickable tags linking to filtered blog views
- [ ] Style tags with consistent color scheme

---

## Phase 3: Blog Categories System ✅ COMPLETE

### Category Management ✅
- [x] Create `/admin/categories/index.astro` - Category management page
- [x] Create `/api/admin/categories.ts` - Create/List categories
- [x] Create `/api/admin/categories/[id].ts` - Update/Delete categories
- [x] Slug auto-generation
- [x] Duplicate prevention

### Category Navigation ✅
- [x] Add category filter on `/admin/blogs/index.astro`
- [x] Display category in blog admin listing
- [ ] Create `/blogs/category/[slug].astro` - Category-filtered blog listing
- [ ] Add category badges to public blog cards
- [ ] Display category in public blog detail page

---

## Phase 4: Search & Filter Functionality 🔄 PARTIAL

### Blog Search 🔄
- [x] Search by title in admin blog listing
- [x] Search by title/category in admin categories
- [ ] Create `SearchBar.astro` component with debounced search
- [ ] Create `/api/blogs/search.ts` endpoint with full-text search
- [ ] Search result highlighting

### Filter System 🔄
- [x] Status filter on admin blogs (Draft/Published/Archived)
- [x] Category filter on admin blogs
- [ ] Create `FilterPanel.astro` component
- [ ] Tag filter (multi-select)
- [ ] Date range picker
- [ ] URL-based filtering with query params

### Forum Search ❌
- [ ] Add search bar to forum index page
- [ ] Create `/api/forums/search.ts` for thread search

---

## Phase 5: Pagination System ✅ COMPLETE

### Blog Pagination ✅
- [x] Update `/blogs/index.astro` with server-side pagination
- [x] Accept `page` and `limit` query parameters
- [x] Default: 12 items per page
- [x] Calculate total pages
- [x] Previous/Next navigation
- [x] Page numbers with proper styling
- [x] Show total count: "Showing 1-12 of 156 blogs"

### Admin Pagination ✅
- [x] Pagination on `/admin/blogs/index.astro`
- [x] Pagination on `/admin/categories/index.astro`

### Forum Pagination ❌
- [ ] Add pagination to thread listings in forums
- [ ] Add pagination to comment threads (nested comments)

---

## Phase 6: Lazy Loading & Performance ❌ NOT STARTED

### Image Lazy Loading ❌
- [ ] Add `loading="lazy"` to all blog images
- [ ] Implement blur placeholder (LQIP) for images
- [ ] Use `srcset` for responsive images
- [ ] Consider `<picture>` element for format optimization (WebP)

### Content Lazy Loading ❌
- [ ] Implement "Load More" button as alternative to pagination
- [ ] Infinite scroll option (configurable)
- [ ] Skeleton loading states for blog cards
- [ ] Create `BlogCardSkeleton.astro` component

### API Response Optimization ❌
- [ ] Add response caching headers
- [ ] Implement database query caching (Redis optional)
- [ ] Optimize Prisma queries with proper `select` fields
- [ ] Add database indexes for frequently queried fields

---

## Phase 7: Blog UX Improvements 🔄 PARTIAL

### Reading Experience 🔄
- [ ] Add estimated reading time display
- [ ] Add progress bar indicator while reading
- [ ] Implement "Table of Contents" for long articles
- [ ] Add "Copy Link" button for easy sharing
- [ ] Add "Print Article" button with print-optimized styles

### Related Content ❌
- [ ] Create `RelatedPosts.astro` component
- [ ] Add "Previous/Next Post" navigation at bottom
- [ ] "Popular Posts" sidebar widget

### User Engagement ❌
- [ ] Add "Reactions" beyond views (👍, ❤️, 🎉)
- [ ] Share buttons (copy link, Twitter/X, LinkedIn, Facebook)
- [ ] Bookmark/Save functionality for logged-in users
- [ ] Reading list feature

---

## Phase 8: Blog Structure Best Practices 🔄 PARTIAL

### SEO Optimization 🔄
- [x] Basic meta tags in Layout.astro
- [ ] Add `<meta>` tags for each blog:
  - [ ] `og:title`, `og:description`, `og:image`
  - [ ] `twitter:card`, `twitter:title`, `twitter:description`
  - [ ] `article:published_time`, `article:author`, `article:tag`
- [ ] Generate XML sitemap for blogs
- [ ] Add JSON-LD structured data for articles
- [ ] Implement canonical URLs

### Content Structure ✅
- [x] Consistent blog post template with title, image, author, content
- [x] Rich text editor for admin with formatting
- [ ] Heading hierarchy enforcement
- [ ] Image upload with alt text
- [ ] Code block syntax highlighting
- [ ] Embed support (YouTube, Twitter, CodePen)

---

## Phase 9: Forum Enhancements 🔄 PARTIAL

### Thread Features 🔄
- [x] Add thread status (OPEN/CLOSED/RESOLVED) - schema only
- [x] Implement thread pinning for moderators - schema only
- [x] Add thread locking capability - schema only
- [ ] "Mark as Solved" for Q&A style forums
- [ ] Thread subscription (notify on new replies)

### Discussion UX 🔄
- [x] Rich text editor for comments (basic)
- [x] Like system for comments
- [ ] Add quote feature for replies
- [ ] Implement @mention notifications
- [ ] Add reaction system for comments (👍, 👎, ❤️)
- [ ] Image/file attachments in threads

### Moderation Tools ❌
- [ ] Report system for inappropriate content
- [ ] Moderator dashboard for reported content
- [ ] User reputation/karma system
- [ ] Post editing history (audit trail)

---

## Phase 10: Security Enhancements 🔄 PARTIAL

### Input Validation & Sanitization 🔄
- [x] Basic server-side validation in API endpoints
- [ ] Implement comprehensive validation (zod/yup)
- [ ] Sanitize HTML content before storage (DOMPurify)
- [ ] Escape all user-generated content on render
- [ ] Implement Content Security Policy (CSP) headers

### Rate Limiting ❌
- [ ] Add rate limiting to all API endpoints
- [ ] Implement progressive delays for failed auth attempts

### CSRF Protection ❌
- [ ] Generate CSRF tokens for all forms
- [ ] Validate CSRF tokens server-side
- [ ] Implement SameSite cookie attributes

### XSS Prevention 🔄
- [x] Review `set:html` usages (minimal usage)
- [ ] Implement CSP with nonce for inline scripts
- [ ] Validate file uploads (type, size, malware scan)

### SQL Injection Prevention ✅
- [x] Use Prisma ORM (handles parameterization)
- [x] No raw SQL without parameterization

### Authentication Security 🔄
- [x] Secure session management via Better Auth
- [ ] Encrypt sensitive session data
- [ ] Add session timeout and renewal
- [ ] Log authentication events
- [ ] Two-factor authentication option (future)

---

## Phase 11: Performance Monitoring & Analytics ❌ NOT STARTED

### Blog Analytics ❌
- [ ] Track individual blog post views
- [ ] Record unique vs. returning visitors
- [ ] Track time spent on page
- [ ] Popular posts dashboard for admin

### Error Monitoring ❌
- [ ] Implement error logging
- [ ] Track 404 pages
- [ ] Monitor API response times
- [ ] Set up alerts for critical errors

---

## Phase 12: Additional Suggestions ❌ NOT STARTED

### Accessibility (A11y) ❌
- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works everywhere
- [ ] Test with screen readers
- [ ] Maintain proper color contrast ratios
- [ ] Add skip links for main content

### Internationalization (i18n) ❌
- [ ] Structure content for future translation
- [ ] Use date/number formatting based on locale
- [ ] RTL support consideration

### PWA Features (Optional) ❌
- [ ] Add service worker for offline reading
- [ ] Implement push notifications for new posts
- [ ] Cache frequently accessed content

### Email Integration ❌
- [ ] Newsletter subscription for blog updates
- [ ] Email notifications for forum replies
- [ ] Weekly digest of popular posts

---

## UI/UX Improvements Completed ✅

### Navigation ✅
- [x] Updated Nav.astro with responsive padding and alignment
- [x] Full-width container matching section alignment

### Hero Section ✅
- [x] Fixed character positioning to touch About section
- [x] Responsive height adjustments

---

## Implementation Priority

| Priority | Phase | Status | Estimated Effort |
|----------|-------|--------|------------------|
| ✅ Complete | Phase 1: Schema | **DONE** | 2-3 hours |
| ✅ Complete | Phase 3: Categories | **DONE** | 3-4 hours |
| ✅ Complete | Phase 5: Pagination | **DONE** | 2-3 hours |
| 🔄 High | Phase 1.5: RBAC | **IN PROGRESS** | 4-5 hours |
| 🔄 High | Phase 1.6: Admin Panel | **PARTIAL** | 8-12 hours |
| 🔄 High | Phase 2: Tags | **PARTIAL** | 3-4 hours |
| 🔴 High | Phase 10: Security | **NOT STARTED** | 4-6 hours |
| 🔄 Medium | Phase 4: Search & Filter | **PARTIAL** | 4-5 hours |
| 🔴 Medium | Phase 6: Lazy Loading | **NOT STARTED** | 2-3 hours |
| 🔴 Medium | Phase 7: UX Improvements | **NOT STARTED** | 4-5 hours |
| 🔴 Medium | Phase 9: Forum Enhancements | **NOT STARTED** | 4-5 hours |
| 🔴 Low | Phase 8: Blog Structure | **PARTIAL** | 2-3 hours |
| 🔴 Low | Phase 11: Analytics | **NOT STARTED** | 3-4 hours |
| 🔴 Low | Phase 12: Additional | **NOT STARTED** | Ongoing |

---

## Quick Wins (Ready to Implement)

These can be done immediately with minimal effort:

1. ✅ Add `loading="lazy"` to all images
2. ✅ Add reading time calculation
3. ✅ Implement basic pagination on blog index
4. ✅ Add social sharing buttons
5. ✅ Add proper meta tags for SEO
6. ✅ Add skeleton loading states

---

## Recently Completed (Last Session)

1. ✅ **Category Management System** - Full CRUD with admin UI
2. ✅ **Category Filter in Blogs Admin** - Filter blogs by category
3. ✅ **Navigation Bar Alignment** - Industry-standard responsive width
4. ✅ **Hero Section Fix** - Character now touches About section

---

## Notes

- All API endpoints should include proper error handling and return consistent response formats
- Use TypeScript for type safety across all new components
- Follow existing design patterns (Bebas Neue headings, Schibsted Grotesk body, dark theme)
- Test all features on mobile for responsive design
- Document all new API endpoints in a central location
