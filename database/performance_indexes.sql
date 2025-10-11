-- Performance optimization indexes for Momentum app
-- Run these in your Supabase SQL editor for better query performance

-- Composite index for tasks by user and completion status (for filtering completed/pending tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);

-- Index for tasks by user and due date (for date-based queries)
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);

-- Composite index for created_at queries (for statistics)
CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at ON tasks(user_id, created_at);

-- Composite index for updated_at queries (for completion tracking)
CREATE INDEX IF NOT EXISTS idx_tasks_user_updated_at ON tasks(user_id, updated_at);

-- Index for urgent_tasks table
CREATE INDEX IF NOT EXISTS idx_urgent_tasks_user_id ON urgent_tasks(user_id);

-- Index for users table (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Optimize existing indexes by analyzing table statistics
ANALYZE tasks;
ANALYZE urgent_tasks;
ANALYZE users;