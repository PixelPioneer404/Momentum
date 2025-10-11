import { supabase } from './supabase';

export interface UrgentTask {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

// Get user's urgent task (should only be one per user)
export async function getUserUrgentTask(userId: string): Promise<UrgentTask | null> {
    try {
        console.log('🔍 Service: Querying urgent_tasks for user_id:', userId);
        console.log('🔍 Service: User ID type:', typeof userId);
        console.log('🔍 Service: User ID length:', userId.length);
        
        // Get the latest urgent task for the user (in case there are multiple)
        const { data, error } = await supabase
            .from('urgent_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('❌ Error fetching urgent task:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('📝 No urgent task found for user:', userId);
            return null;
        }

        const urgentTask = data[0];
        console.log('✅ Found urgent task:', urgentTask);
        return urgentTask;
    } catch (error) {
        console.error('❌ getUserUrgentTask error:', error);
        return null;
    }
}

// Create or update urgent task (upsert with unique constraint)
export async function createOrUpdateUrgentTask(userId: string, title: string): Promise<UrgentTask | null> {
    try {
        console.log('🔄 Creating/updating urgent task for user:', userId);
        
        // Use upsert with the unique constraint (user_id)
        // This will automatically update if exists, insert if doesn't exist
        const { data, error } = await supabase
            .from('urgent_tasks')
            .upsert({
                user_id: userId,
                title: title.trim()
            }, {
                onConflict: 'user_id'  // Specify the unique constraint column
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating/updating urgent task:', error);
            throw error;
        }

        console.log('✅ Urgent task created/updated successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ createOrUpdateUrgentTask error:', error);
        return null;
    }
}

// Delete urgent task
export async function deleteUrgentTask(userId: string): Promise<boolean> {
    try {
        console.log('🗑️ Service: Deleting urgent task for user:', userId);
        
        const { error } = await supabase
            .from('urgent_tasks')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error deleting urgent task:', error);
            throw error;
        }

        console.log('✅ Urgent task deleted successfully from database');
        return true;
    } catch (error) {
        console.error('❌ deleteUrgentTask error:', error);
        return false;
    }
}