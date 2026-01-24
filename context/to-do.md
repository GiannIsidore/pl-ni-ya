# Blog & Forum Improvements - TO-DO List

> **Goal**: Implement industry-standard features for quick-response, user-friendly blogs and forums with enhanced security, performance, and user experience.

---

## Phase 1: Database Schema Enhancements

### Blog Schema Updates
- [x] Add `Tag` model with many-to-many relation to `Blog`
  ```prisma
  model Tag {
    id    Int    @id @default(autoincrement())
    name  String @unique
    slug  String @unique
    blogs BlogTag[]
  }
  ```
- [x] Add `Category` model for organizing blogs
  ```prisma
  model Category {
    id          Int      @id @default(autoincrement())
    name        String   @unique
    slug        String   @unique
    description String?  @db.Text
    icon        String?  // Optional category icon
    blogs       Blog[]
  }
  ```
- [x] Update `Blog` model with new fields:
  - [x] `categoryId` - Foreign key to Category
  - [x] `authorId` - Foreign key to User (admin users)
  - [x] `status` - Enum: DRAFT | PUBLISHED | ARCHIVED
  - [x] `isFeatured` - Boolean for featured posts
  - [x] `publishedAt` - DateTime for scheduled publishing
  - [x] `readTime` - Estimated reading time (auto-calculated)

### Forum Schema Updates
- [x] Add `isLocked` field to `Thread` for moderation
- [x] Add `isPinned` field to `Thread` for sticky threads
- [x] Add `status` field to `Thread` - Enum: OPEN | CLOSED | RESOLVED

### User Role Schema Updates
- [x] Add `Role` enum to Prisma schema:
  ```prisma
  enum Role {
    USER        // Regular users - view/read blogs, author forums
    MODERATOR   // Limited admin - can moderate content, ban users
    ADMIN       // Full access - manage everything
  }
  ```
- [x] Update `User` model with role-related fields:
  ```prisma
  model User {
    // ... existing fields
    role          Role      @default(USER)
    isBanned      Boolean   @default(false)
    bannedAt      DateTime?
    bannedBy      String?   // ID of admin/mod who banned
    banReason     String?   @db.Text
    bannedUntil   DateTime? // Null = permanent, Date = temporary
  }
  ```
- [x] Add `AuditLog` model for tracking admin/mod actions:
  ```prisma
  model AuditLog {
    id          Int      @id @default(autoincrement())
    action      String   // e.g., "BAN_USER", "DELETE_THREAD", "EDIT_BLOG"
    targetType  String   // e.g., "User", "Thread", "Blog"
    targetId    String
    performedBy String   // User ID of admin/mod
    details     String?  @db.Text // JSON with additional context
    ipAddress   String?
    createdAt   DateTime @default(now())
    
    performer   User     @relation(fields: [performedBy], references: [id])
    
    @@index([performedBy])
    @@index([createdAt])
    @@index([targetType, targetId])
  }
  ```

---

## Phase 1.5: Role-Based Access Control (RBAC)

### Role Definitions & Permissions

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

### Authorization Middleware
- [ ] Create `src/lib/auth-guard.ts` with:
  ```typescript
  export function requireAuth(allowedRoles: Role[])
  export function requireAdmin()
  export function requireModerator()
  export function isUserBanned(userId: string): Promise<boolean>
  ```
- [ ] Create `src/lib/permissions.ts` with:
  ```typescript
  export const PERMISSIONS = {
    BLOG_CREATE: ['MODERATOR', 'ADMIN'],
    BLOG_EDIT_ANY: ['ADMIN'],
    BLOG_DELETE: ['ADMIN'],
    THREAD_MODERATE: ['MODERATOR', 'ADMIN'],
    USER_BAN: ['MODERATOR', 'ADMIN'],
    USER_MANAGE_ROLES: ['ADMIN'],
    ADMIN_PANEL_ACCESS: ['MODERATOR', 'ADMIN'],
    SYSTEM_SETTINGS: ['ADMIN'],
  }
  export function hasPermission(userRole: Role, permission: string): boolean
  ```
- [ ] Update `src/middleware.ts` to check:
  - [ ] User authentication status
  - [ ] User ban status
  - [ ] Role-based route protection

### API Route Protection
- [ ] Protect all `/api/blogs/*` mutation endpoints (Admin only for create/edit/delete)
- [ ] Protect moderation endpoints (Moderator+ only)
- [ ] Protect `/api/users/ban` (Moderator+ only)
- [ ] Protect `/api/users/role` (Admin only)
- [ ] Add role checks to existing forum API endpoints

### User Ban System
- [ ] Create `/api/users/ban.ts` - Ban a user
  - [ ] Required: `userId`, `reason`
  - [ ] Optional: `duration` (days, null = permanent)
  - [ ] Creates audit log entry
- [ ] Create `/api/users/unban.ts` - Unban a user
  - [ ] Creates audit log entry
- [ ] Add ban check middleware to all authenticated routes
- [ ] Show ban message with reason and expiration to banned users
- [ ] Auto-unban system for temporary bans

---

## Phase 1.6: Admin Panel (Dashboard)

### Admin Layout & Navigation
- [ ] Create `/admin` route group with:
  - [ ] `src/layouts/AdminLayout.astro` - Admin-specific layout
  - [ ] Protected by role middleware (MODERATOR, ADMIN)
- [ ] Create `AdminSidebar.astro` component:
  ```
  📊 Dashboard (overview stats)
  ├── 📝 Blog Management
  │   ├── All Posts
  │   ├── Create New
  │   ├── Categories
  │   └── Tags
  ├── 💬 Forum Management
  │   ├── All Forums
  │   ├── Threads (with moderation queue)
  │   └── Reported Content
  ├── 👥 User Management
  │   ├── All Users
  │   ├── Banned Users
  │   └── Role Management (Admin only)
  ├── 📊 Analytics
  │   ├── Traffic
  │   └── Engagement
  ├── 📋 Audit Logs
  └── ⚙️ Settings (Admin only)
  ```
- [ ] Role-based menu visibility:
  - [ ] Moderators: Hide "Settings", "Role Management"
  - [ ] Admins: Full access

### Admin Dashboard Pages

#### Main Dashboard (`/admin/index.astro`)
- [ ] Overview statistics cards:
  - [ ] Total users, new users (last 7 days)
  - [ ] Total blogs, views this week
  - [ ] Total threads, comments this week
  - [ ] Pending moderation items
- [ ] Quick action buttons
- [ ] Recent activity feed
- [ ] System health indicators

#### Blog Management (`/admin/blogs/*`)
- [ ] `/admin/blogs/index.astro` - Blog listing with:
  - [ ] Status filter (Draft/Published/Archived)
  - [ ] Category filter
  - [ ] Search by title
  - [ ] Bulk actions (publish, archive, delete)
  - [ ] Quick edit inline
- [ ] `/admin/blogs/create.astro` - Create new blog
- [ ] `/admin/blogs/[id]/edit.astro` - Edit blog
- [ ] Rich text editor with:
  - [ ] Image upload
  - [ ] Code blocks
  - [ ] Embeds
  - [ ] Preview mode

#### Forum Moderation (`/admin/forums/*`)
- [ ] `/admin/forums/index.astro` - Forum overview
- [ ] `/admin/forums/threads.astro` - Thread management:
  - [ ] Filter: All | Reported | Locked | Pinned
  - [ ] Actions: Pin, Lock, Delete, Move
- [ ] `/admin/forums/reported.astro` - Reported content queue:
  - [ ] Show reporter, reason, reported content
  - [ ] Actions: Dismiss, Warn, Delete, Ban Author

#### User Management (`/admin/users/*`)
- [ ] `/admin/users/index.astro` - User listing:
  - [ ] Filter by role
  - [ ] Search by username/email
  - [ ] Sort by: registration date, last active
  - [ ] Quick actions: View profile, Ban, Change role
- [ ] `/admin/users/[id].astro` - User detail page:
  - [ ] User info
  - [ ] Activity history
  - [ ] Posts/threads/comments
  - [ ] Admin actions
- [ ] `/admin/users/banned.astro` - Banned users list:
  - [ ] Show ban reason, duration, banned by
  - [ ] Unban action
- [ ] `/admin/users/roles.astro` - Role management (Admin only):
  - [ ] Promote/demote users
  - [ ] View role history

#### Analytics (`/admin/analytics/*`)
- [ ] `/admin/analytics/index.astro` - Dashboard analytics:
  - [ ] Page views over time (chart)
  - [ ] Popular blogs/threads
  - [ ] User growth chart
  - [ ] Geographic distribution (if tracked)

#### Audit Logs (`/admin/audit-logs.astro`)
- [ ] Searchable audit log table:
  - [ ] Filter by action type
  - [ ] Filter by performer
  - [ ] Date range filter
- [ ] Show: Action, Target, Performer, Date, IP, Details
- [ ] Export functionality (CSV)

#### Settings (`/admin/settings.astro`) - Admin Only
- [ ] Site configuration
- [ ] Feature toggles
- [ ] Email settings
- [ ] Security settings

### Admin Panel Styling
- [ ] Maintain consistent dark theme (neutral-900 base)
- [ ] Professional dashboard aesthetic
- [ ] Responsive design for tablet/desktop
- [ ] Data tables with sorting/filtering
- [ ] Toast notifications for actions
- [ ] Confirmation modals for destructive actions

### Admin API Endpoints
- [ ] `/api/admin/stats.ts` - Dashboard statistics
- [ ] `/api/admin/blogs/*` - Blog CRUD operations
- [ ] `/api/admin/users/list.ts` - Paginated user list
- [ ] `/api/admin/users/[id]/role.ts` - Change user role
- [ ] `/api/admin/audit-logs.ts` - Fetch audit logs
- [ ] `/api/admin/reports/*` - Handle reported content

---

## Phase 2: Blog Tags System

### Admin Tag Management
- [ ] Create `/admin/tags/index.astro` - Tag listing with CRUD operations
- [ ] Create `/api/tags/create.ts` - Create new tags
- [ ] Create `/api/tags/delete.ts` - Delete tags
- [ ] Create `/api/tags/update.ts` - Update tag details

### Blog Tag Assignment
- [ ] Update blog editor to include tag selection UI
  - [ ] Multi-select dropdown for existing tags
  - [ ] Inline tag creation capability
  - [ ] Tag chips display with remove option
- [ ] Update `/api/blogs/create.ts` to handle tag assignment
- [ ] Update `/api/blogs/update.ts` to handle tag updates

### Tag Display (Frontend)
- [ ] Add tag chips to blog cards on index page
- [ ] Add tag section to blog detail page `[slug].astro`
- [ ] Create clickable tags linking to filtered blog views
- [ ] Style tags with consistent color scheme (e.g., neutral badges with hover states)

---

## Phase 3: Blog Categories System

### Category Management
- [ ] Create `/admin/categories/index.astro` - Category management page
- [ ] Create `/api/categories/create.ts` - Create categories
- [ ] Create `/api/categories/delete.ts` - Delete categories
- [ ] Create `/api/categories/update.ts` - Update categories

### Category Navigation
- [ ] Add category filter sidebar/dropdown on `/blogs/index.astro`
- [ ] Create `/blogs/category/[slug].astro` - Category-filtered blog listing
- [ ] Add category badges to blog cards
- [ ] Display category in blog detail page

---

## Phase 4: Search & Filter Functionality

### Blog Search
- [ ] Create `SearchBar.astro` component with:
  - [ ] Debounced search input (300ms delay)
  - [ ] Real-time results dropdown (AJAX)
  - [ ] Keyboard navigation support
  - [ ] Search history (localStorage)
- [ ] Create `/api/blogs/search.ts` endpoint with:
  - [ ] Full-text search on title, excerpt, content
  - [ ] Filter by category, tags, date range
  - [ ] Sort options: relevance, date, views
  - [ ] Search result highlighting

### Filter System
- [ ] Create `FilterPanel.astro` component:
  - [ ] Category filter (checkbox list or dropdown)
  - [ ] Tag filter (multi-select)
  - [ ] Date range picker
  - [ ] "Clear All Filters" button
- [ ] Implement URL-based filtering (query params)
  - [ ] Example: `/blogs?category=tech&tags=astro,prisma&sort=latest`
- [ ] Persist filter state across navigation

### Forum Search
- [ ] Add search bar to forum index page
- [ ] Create `/api/forums/search.ts` for thread search
- [ ] Search across thread title and content
- [ ] Filter threads by forum, author, date

---

## Phase 5: Pagination System

### Blog Pagination
- [ ] Update `/blogs/index.astro` with server-side pagination:
  - [ ] Accept `page` and `limit` query parameters
  - [ ] Default: 12 items per page
  - [ ] Calculate total pages
- [ ] Enhance `Pagination.astro` component:
  - [ ] Previous/Next navigation
  - [ ] Page numbers with ellipsis for large page counts
  - [ ] "Jump to page" input for large datasets
  - [ ] Show total count: "Showing 1-12 of 156 blogs"
- [ ] Implement SEO-friendly pagination URLs
  - [ ] `/blogs?page=2` or `/blogs/page/2`

### Forum Pagination
- [ ] Add pagination to thread listings in forums
- [ ] Add pagination to comment threads (nested comments)

---

## Phase 6: Lazy Loading & Performance

### Image Lazy Loading
- [ ] Add `loading="lazy"` to all blog images
- [ ] Implement blur placeholder (LQIP) for images
- [ ] Use `srcset` for responsive images
- [ ] Consider `<picture>` element for format optimization (WebP)

### Content Lazy Loading
- [ ] Implement "Load More" button as alternative to pagination
- [ ] Infinite scroll option (configurable)
- [ ] Skeleton loading states for blog cards
- [ ] Create `BlogCardSkeleton.astro` component

### API Response Optimization
- [ ] Add response caching headers
- [ ] Implement database query caching (Redis optional)
- [ ] Optimize Prisma queries with proper `select` fields
- [ ] Add database indexes for frequently queried fields:
  ```sql
  CREATE INDEX idx_blog_category ON Blog(categoryId);
  CREATE INDEX idx_blog_status ON Blog(status);
  CREATE INDEX idx_blog_published_at ON Blog(publishedAt);
  CREATE INDEX idx_tag_slug ON Tag(slug);
  ```

---

## Phase 7: Blog UX Improvements

### Reading Experience
- [ ] Add estimated reading time display
  - [ ] Calculate based on word count (~200 words/min)
- [ ] Add progress bar indicator while reading
- [ ] Implement "Table of Contents" for long articles
  - [ ] Auto-generate from H2/H3 headings
  - [ ] Sticky sidebar on desktop
  - [ ] Collapsible TOC on mobile
- [ ] Add "Copy Link" button for easy sharing
- [ ] Add "Print Article" button with print-optimized styles

### Related Content
- [ ] Create `RelatedPosts.astro` component
  - [ ] Show 3-4 related posts based on tags/category
  - [ ] Algorithm: shared tags > same category > recent posts
- [ ] Add "Previous/Next Post" navigation at bottom
- [ ] "Popular Posts" sidebar widget

### User Engagement
- [ ] Add "Reactions" beyond views (👍, ❤️, 🎉)
- [ ] Share buttons (copy link, Twitter/X, LinkedIn, Facebook)
- [ ] Bookmark/Save functionality for logged-in users
- [ ] Reading list feature

---

## Phase 8: Blog Structure Best Practices

### SEO Optimization
- [ ] Add `<meta>` tags for each blog:
  - [ ] `og:title`, `og:description`, `og:image`
  - [ ] `twitter:card`, `twitter:title`, `twitter:description`
  - [ ] `article:published_time`, `article:author`, `article:tag`
- [ ] Generate XML sitemap for blogs
- [ ] Add JSON-LD structured data for articles
- [ ] Implement canonical URLs

### Content Structure
- [ ] Define consistent blog post template:
  ```
  - Title (H1)
  - Featured Image
  - Author + Date + Read Time + Category
  - Excerpt/Lead paragraph (highlighted)
  - Table of Contents (for long posts)
  - Main Content
  - Tags Section
  - Author Bio Box
  - Related Posts
  - Comments Section (if enabled)
  ```
- [ ] Rich text editor for admin with:
  - [ ] Heading hierarchy enforcement
  - [ ] Image upload with alt text
  - [ ] Code block syntax highlighting
  - [ ] Embed support (YouTube, Twitter, CodePen)

---

## Phase 9: Forum Enhancements

### Thread Features
- [ ] Add thread status badges (Open/Closed/Resolved)
- [ ] Implement thread pinning for moderators
- [ ] Add thread locking capability
- [ ] "Mark as Solved" for Q&A style forums
- [ ] Thread subscription (notify on new replies)

### Discussion UX
- [ ] Add quote feature for replies
- [ ] Implement @mention notifications
- [ ] Add reaction system for comments (👍, 👎, ❤️)
- [ ] Rich text editor for comments (markdown support)
- [ ] Image/file attachments in threads

### Moderation Tools
- [ ] Report system for inappropriate content
- [ ] Moderator dashboard for reported content
- [ ] User reputation/karma system
- [ ] Post editing history (audit trail)

---

## Phase 10: Security Enhancements

### Input Validation & Sanitization
- [ ] Implement server-side input validation (zod/yup)
- [ ] Sanitize HTML content before storage (DOMPurify)
- [ ] Escape all user-generated content on render
- [ ] Implement Content Security Policy (CSP) headers

### Rate Limiting
- [ ] Add rate limiting to all API endpoints:
  - [ ] General: 100 requests/minute per IP
  - [ ] Search: 30 requests/minute per IP
  - [ ] POST requests: 10 requests/minute per user
- [ ] Implement progressive delays for failed auth attempts

### CSRF Protection
- [ ] Generate CSRF tokens for all forms
- [ ] Validate CSRF tokens server-side
- [ ] Implement SameSite cookie attributes

### XSS Prevention
- [ ] Review all `set:html` usages
- [ ] Implement CSP with nonce for inline scripts
- [ ] Validate file uploads (type, size, malware scan)

### SQL Injection Prevention
- [ ] Audit all Prisma queries (Prisma handles this, but verify)
- [ ] Never use raw SQL without parameterization
- [ ] Implement query logging for monitoring

### Authentication Security
- [ ] Encrypt sensitive session data
- [ ] Implement secure session management
- [ ] Add session timeout and renewal
- [ ] Log authentication events (login, logout, failed attempts)
- [ ] Two-factor authentication option (future)

---

## Phase 11: Performance Monitoring & Analytics

### Blog Analytics
- [ ] Track individual blog post views
- [ ] Record unique vs. returning visitors
- [ ] Track time spent on page
- [ ] Popular posts dashboard for admin

### Error Monitoring
- [ ] Implement error logging (console, file, or service)
- [ ] Track 404 pages
- [ ] Monitor API response times
- [ ] Set up alerts for critical errors

---

## Phase 12: Additional Suggestions

### Accessibility (A11y)
- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works everywhere
- [ ] Test with screen readers
- [ ] Maintain proper color contrast ratios
- [ ] Add skip links for main content

### Internationalization (i18n)
- [ ] Structure content for future translation
- [ ] Use date/number formatting based on locale
- [ ] RTL support consideration

### PWA Features (Optional)
- [ ] Add service worker for offline reading
- [ ] Implement push notifications for new posts
- [ ] Cache frequently accessed content

### Email Integration
- [ ] Newsletter subscription for blog updates
- [ ] Email notifications for forum replies
- [ ] Weekly digest of popular posts

### Admin Dashboard
- [ ] Create unified admin panel for:
  - [ ] Blog management
  - [ ] Tag/Category management
  - [ ] User management
  - [ ] Content moderation
  - [ ] Analytics overview

---

## Implementation Priority

| Priority | Phase | Estimated Effort |
|----------|-------|------------------|
| ✅ Complete | Phase 1: Schema | 2-3 hours |
| 🔴 High | Phase 1.5: RBAC | 4-5 hours |
| 🔴 High | Phase 1.6: Admin Panel | 8-12 hours |
| 🔴 High | Phase 2: Tags | 3-4 hours |
| 🔴 High | Phase 5: Pagination | 2-3 hours |
| 🔴 High | Phase 6: Lazy Loading | 2-3 hours |
| 🔴 High | Phase 10: Security | 4-6 hours |
| 🟡 Medium | Phase 3: Categories | 3-4 hours |
| 🟡 Medium | Phase 4: Search & Filter | 4-5 hours |
| 🟡 Medium | Phase 7: UX Improvements | 4-5 hours |
| 🟡 Medium | Phase 9: Forum Enhancements | 4-5 hours |
| 🟢 Low | Phase 8: Blog Structure | 2-3 hours |
| 🟢 Low | Phase 11: Analytics | 3-4 hours |
| 🟢 Low | Phase 12: Additional | Ongoing |

---

## Quick Wins (Implement First)

These can be done immediately with minimal effort:

1. ✅ Add `loading="lazy"` to all images
2. ✅ Add reading time calculation
3. ✅ Implement basic pagination on blog index
4. ✅ Add social sharing buttons
5. ✅ Add proper meta tags for SEO
6. ✅ Add skeleton loading states

---

## Notes

- All API endpoints should include proper error handling and return consistent response formats
- Use TypeScript for type safety across all new components
- Follow existing design patterns (Bebas Neue headings, Montserrat body, dark theme)
- Test all features on mobile for responsive design
- Document all new API endpoints in a central location
