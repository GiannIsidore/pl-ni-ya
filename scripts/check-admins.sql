SELECT COUNT(*) as admin_users FROM User WHERE role = 'ADMIN';
SELECT id, email, username, role FROM User WHERE role = 'ADMIN' LIMIT 5;