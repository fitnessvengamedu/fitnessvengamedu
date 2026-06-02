paths:
- "supabase/**/*.sql"
- "migrations/**/*.sql"
- "db/**/*.ts"
- "db/**/*.js"
---

# Database Development Rules

Ensure all database schema changes and queries comply with these rules to keep the database fast and secure:

1. **Migrations (DDL)**:
   - Never apply schema changes directly through a console or raw script on production databases.
   - All changes (creating tables, altering columns, adding indexes) must be defined in sequential SQL migration files (e.g. Supabase migrations).
   - Ensure SQL commands are idempotent and safe to run multiple times.

2. **Row Level Security (RLS)**:
   - Row Level Security (RLS) is **mandatory** for every single table created in the public schema.
   - Always run `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.
   - Write clear policies targeting specific roles (e.g., `authenticated`, `anon`).
   - Test policies thoroughly to verify users cannot view or modify other users' data.

3. **Performance & Optimization**:
   - Every table must have a primary key.
   - Define foreign key constraints on all relations to ensure referential integrity.
   - Create indexes on fields frequently used in filters, joins, or ordering (e.g., `user_id`, `created_at`).
   - Avoid `SELECT *` where possible; retrieve only the required fields.

4. **Triggers & Functions**:
   - Use PostgreSQL triggers for automated actions (like updating `updated_at` timestamps or syncing auth profiles).
   - Keep custom Postgres functions simple and optimized to minimize execution overhead.
