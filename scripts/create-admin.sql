-- Insert admin user for testing
INSERT INTO User (id, email, name, username, role, emailVerified, createdAt, updatedAt) 
VALUES ('admin-test-id', 'admin@test.com', 'Admin User', 'admin', 'ADMIN', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE role = 'ADMIN', name = 'Admin User', username = 'admin';

-- Insert test blog post
INSERT INTO Blog (title, slug, excerpt, content, status, publishedAt, readTime, authorId, createdAt, updatedAt) 
VALUES ('Test Blog Post', 'test-blog-post', 'This is a test blog post for admin dashboard testing', 'This is the full content of the test blog post.', 'PUBLISHED', NOW(), 2, 'admin-test-id', NOW(), NOW())
ON DUPLICATE KEY UPDATE title = 'Test Blog Post', status = 'PUBLISHED';

-- Insert test thread (assuming forum with ID 1 exists)
INSERT INTO Thread (title, slug, content, forumId, authorId, status, createdAt, updatedAt) 
VALUES ('Test Thread', 'test-thread', 'This is a test thread for admin dashboard testing', 1, 'admin-test-id', 'OPEN', NOW(), NOW())
ON DUPLICATE KEY UPDATE title = 'Test Thread', status = 'OPEN';

-- Insert audit log entry
INSERT INTO AuditLog (action, targetType, targetId, performedBy, details, ipAddress, createdAt) 
VALUES ('CREATE_ADMIN_USER', 'User', 'admin-test-id', 'admin-test-id', '{"message": "Admin user created for testing"}', '127.0.0.1', NOW());