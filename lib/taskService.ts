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

// Get all tasks for the current user
export async function getUserTasks(userId: string): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
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

// Update multiple tasks order (for drag and drop reordering)
export async function updateTasksOrder(tasks: { id: string; task_order: number }[]): Promise<boolean> {
    try {
        const updates = tasks.map(task => ({
            id: task.id,
            task_order: task.task_order
        }));

        for (const update of updates) {
            const { error } = await supabase
                .from('tasks')
                .update({ task_order: update.task_order })
                .eq('id', update.id);

            if (error) {
                console.error('Error updating task order:', error);
                throw error;
            }
        }

        return true;
    } catch (error) {
        console.error('updateTasksOrder error:', error);
        return false;
    }
}

// Get the next available order number for new tasks
export async function getNextTaskOrder(userId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('task_order')
            .eq('user_id', userId)
            .order('task_order', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error getting next task order:', error);
            return 0;
        }

        return data && data.length > 0 ? data[0].task_order + 1 : 0;
    } catch (error) {
        console.error('getNextTaskOrder error:', error);
        return 0;
    }
}

// Get task statistics for a specific date
export async function getTaskStatistics(userId: string, date?: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    tasksCreatedToday: number;
    tasksCompletedToday: number;
}> {
    try {
        const today = date || new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error getting task statistics:', error);
            throw error;
        }

        const tasks = data || [];
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const tasksCreatedToday = tasks.filter(task => 
            task.created_at.split('T')[0] === today
        ).length;
        const tasksCompletedToday = tasks.filter(task => 
            task.completed && task.updated_at.split('T')[0] === today
        ).length;

        return {
            totalTasks,
            completedTasks,
            tasksCreatedToday,
            tasksCompletedToday
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