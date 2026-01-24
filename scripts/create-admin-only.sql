-- Create Admin User for Testing
-- This script creates a user with ADMIN role for testing the admin dashboard

-- Insert admin user
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