// MySQL Shell Script to create Admin User
// Save as create-admin.js and run with: mysqlsh -u root -p --file=create-admin.js

// Use the pl_db database
use pl_db;

// Create or update admin user
var result = sql`INSERT INTO User (id, email, name, username, role, emailVerified, isBanned, createdAt, updatedAt)
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
  updatedAt = NOW()`;

// Create test blog post
sql`INSERT INTO Blog (title, slug, excerpt, content, status, publishedAt, readTime, authorId, createdAt, updatedAt)
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
  updatedAt = NOW()`;

// Create test thread
sql`INSERT INTO Thread (title, slug, content, forumId, authorId, status, isLocked, isPinned, createdAt, updatedAt)
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
  updatedAt = NOW()`;

// Create audit log entry
sql`INSERT INTO AuditLog (action, targetType, targetId, performedBy, details, ipAddress, createdAt)
VALUES (
  'CREATE_ADMIN_USER',
  'User',
  'admin-user-001',
  'admin-user-001',
  JSON_OBJECT('message', 'Admin user created for dashboard testing', 'role', 'ADMIN'),
  '127.0.0.1',
  NOW()
)`;

// Create sample audit activities
sql`INSERT INTO AuditLog (action, targetType, targetId, performedBy, details, ipAddress, createdAt)
VALUES 
  ('LOGIN', 'User', 'admin-user-001', 'admin-user-001', JSON_OBJECT('message', 'Admin logged in'), '127.0.0.1', NOW()),
  ('VIEW_DASHBOARD', 'AdminPanel', 'main', 'admin-user-001', JSON_OBJECT('message', 'Admin accessed main dashboard'), '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  ('CREATE_BLOG', 'Blog', '1', 'admin-user-001', JSON_OBJECT('message', 'Admin created test blog'), '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  ('MODERATE_THREAD', 'Thread', '1', 'admin-user-001', JSON_OBJECT('message', 'Admin created test thread'), '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 HOUR))`;

// Verify admin user creation
print('✅ Admin user creation completed!');
print('📧 Email: admin@pl-niya.com');
print('👤 Username: admin');
print('🔐 Role: ADMIN');

// Show created user
var user = sql`SELECT id, email, username, role, emailVerified, isBanned, createdAt FROM User WHERE email = 'admin@pl-niya.com'`;
print('Created user:', user);