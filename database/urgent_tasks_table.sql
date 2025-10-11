-- Create urgent_tasks table
CREATE TABLE urgent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE urgent_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own urgent tasks
CREATE POLICY "Users can view their own urgent tasks" ON urgent_tasks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own urgent tasks
CREATE POLICY "Users can insert their own urgent tasks" ON urgent_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own urgent tasks
CREATE POLICY "Users can update their own urgent tasks" ON urgent_tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own urgent tasks
CREATE POLICY "Users can delete their own urgent tasks" ON urgent_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create an index for faster queries by user_id
CREATE INDEX idx_urgent_tasks_user_id ON urgent_tasks(user_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_urgent_tasks_updated_at 
    BEFORE UPDATE ON urgent_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();