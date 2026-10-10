-- Demo data for local development only. Run after schema.sql:
--   psql "$DATABASE_URL" -f database/seed.sql
--
-- Log in with:  demo@example.com  /  demo-password
-- (The hash below is bcrypt, cost 12, of "demo-password". Never put real
-- passwords or production data in a seed file.)

INSERT INTO users (email, password_hash)
VALUES (
  'demo@example.com',
  '$2b$12$O7mKyRkPczpSxhgK2rD7QuZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO'
);

-- The user id comes from the row above, looked up by email, so this file
-- works whatever id the database gave the user.
INSERT INTO notes (user_id, title, content)
SELECT id, 'Welcome to your notes', 'Edit or delete this note, or write a new one above.'
FROM users
WHERE email = 'demo@example.com';

INSERT INTO notes (user_id, title, content)
SELECT id, 'Shopping', 'Milk, bread, apples'
FROM users
WHERE email = 'demo@example.com';
