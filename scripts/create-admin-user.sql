-- Create Admin User for Testing
-- This script inserts a user with ADMIN role for testing the admin dashboard

-- First, insert or update the admin user
INSERT INTO User (id, email, name, username, role, emailVerified, isBanned, createdAt, updatedAt)
VALUES (
  'admin-user-001',
  'admin@pl-niya.com',
  'Admin User',
  'admin',
  'ADMIN',
  true,
  false,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  role = 'ADMIN',
  name = 'Admin User',
  username = 'admin',
  isBanned = false,
  updatedAt = NOW();

-- Create a test blog post
INSERT INTO Blog (title, slug, excerpt, content, status, publishedAt, readTime, authorId, createdAt, updatedAt)
VALUES (
  'Admin Test Blog',
  'admin-test-blog',
  'This is a test blog post created by admin for dashboard testing.',
  'This is the full content of the test blog post created by the admin user.',
  'PUBLISHED',
  NOW(),
  3,
  'admin-user-001',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  title = 'Admin Test Blog',
  status = 'PUBLISHED',
  publishedAt = NOW(),
  readTime = 3,
  authorId = 'admin-user-001',
  updatedAt = NOW();

-- Create a test thread (assuming forum with ID 1 exists)
INSERT INTO Thread (title, slug, content, forumId, authorId, status, isLocked, isPinned, createdAt, updatedAt)
VALUES (
  'Admin Test Thread',
  'admin-test-thread',
  'This is a test thread created by admin for dashboard testing.',
  1,
  'admin-user-001',
  'OPEN',
  false,
  false,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  title = 'Admin Test Thread',
  status = 'OPEN',
  forumId = 1,
  authorId = 'admin-user-001',
  updatedAt = NOW();

-- Create audit log entry
INSERT INTO AuditLog (action, targetType, targetId, performedBy, details, ipAddress, createdAt)
VALUES (
  'CREATE_ADMIN_USER',
  'User',
  'admin-user-001',
  'admin-user-001',
  '{"message": "Admin user created for dashboard testing", "role": "ADMIN"}',
  '127.0.0.1',
  NOW()
);

-- Create sample audit activities
INSERT INTO AuditLog (action, targetType, targetId, performedBy, details, ipAddress, createdAt)
VALUES 
  ('LOGIN', 'User', 'admin-user-001', 'admin-user-001', '{"message": "Admin logged in"}', '127.0.0.1', NOW()),
  ('VIEW_DASHBOARD', 'AdminPanel', 'main', 'admin-user-001', '{"message": "Admin accessed main dashboard"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  ('CREATE_BLOG', 'Blog', '1', 'admin-user-001', '{"message": "Admin created test blog"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  ('MODERATE_THREAD', 'Thread', '1', 'admin-user-001', '{"message": "Admin created test thread"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Display verification
SELECT 
  id, 
  email, 
  username, 
  role, 
  emailVerified, 
  isBanned,
  createdAt,
  updatedAt
FROM User 
WHERE email = 'admin@pl-niya.com';