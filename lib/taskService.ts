import { supabase } from './supabase';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string;
    due_date: string;
    completed: boolean;
    task_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskData {
    title: string;
    description: string;
    due_date: string;
    task_order: number;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    due_date?: string;
    completed?: boolean;
    task_order?: number;
}

// Get all tasks for the current user - OPTIMIZED
export async function getUserTasks(userId: string): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('id, user_id, title, description, due_date, completed, task_order, created_at, updated_at') // Explicit field selection for better performance
            .eq('user_id', userId)
            .order('task_order', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('getUserTasks error:', error);
        return [];
    }
}

// Create a new task
export async function createTask(userId: string, taskData: CreateTaskData): Promise<Task | null> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: userId,
                title: taskData.title,
                description: taskData.description,
                due_date: taskData.due_date,
                task_order: taskData.task_order
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('createTask error:', error);
        return null;
    }
}

// Update an existing task
export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('updateTask error:', error);
        return null;
    }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('deleteTask error:', error);
        return false;
    }
}

// Toggle task completion status
export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task | null> {
    return updateTask(taskId, { completed });
}

// Update multiple tasks order (for drag and drop reordering) - OPTIMIZED
export async function updateTasksOrder(tasks: { id: string; task_order: number }[]): Promise<boolean> {
    try {
        // Use bulk upsert instead of individual updates - MUCH FASTER
        const updates = tasks.map(task => ({
            id: task.id,
            task_order: task.task_order
        }));

        const { error } = await supabase
            .from('tasks')
            .upsert(updates, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('Error updating task order:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('updateTasksOrder error:', error);
        return false;
    }
}

// Get the next available order number for new tasks - OPTIMIZED
export async function getNextTaskOrder(userId: string): Promise<number> {
    try {
        // Use aggregate function for better performance
        const { data, error } = await supabase
            .from('tasks')
            .select('task_order')
            .eq('user_id', userId)
            .order('task_order', { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle for better performance when expecting 0 or 1 result

        if (error) {
            console.error('Error getting next task order:', error);
            return 0;
        }

        return data ? data.task_order + 1 : 0;
    } catch (error) {
        console.error('getNextTaskOrder error:', error);
        return 0;
    }
}

// Get task statistics for a specific date - OPTIMIZED
export async function getTaskStatistics(userId: string, date?: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    tasksCreatedToday: number;
    tasksCompletedToday: number;
}> {
    try {
        const today = date || new Date().toISOString().split('T')[0];
        
        // Use more efficient queries with aggregation - MUCH FASTER
        const [totalResult, completedResult, createdTodayResult, completedTodayResult] = await Promise.all([
            // Total tasks count
            supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId),
            
            // Completed tasks count
            supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completed', true),
            
            // Tasks created today count
            supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', `${today}T00:00:00.000Z`)
                .lt('created_at', `${today}T23:59:59.999Z`),
            
            // Tasks completed today count
            supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completed', true)
                .gte('updated_at', `${today}T00:00:00.000Z`)
                .lt('updated_at', `${today}T23:59:59.999Z`)
        ]);

        return {
            totalTasks: totalResult.count || 0,
            completedTasks: completedResult.count || 0,
            tasksCreatedToday: createdTodayResult.count || 0,
            tasksCompletedToday: completedTodayResult.count || 0
        };
    } catch (error) {
        console.error('getTaskStatistics error:', error);
        return {
            totalTasks: 0,
            completedTasks: 0,
            tasksCreatedToday: 0,
            tasksCompletedToday: 0
        };
    }
}