import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    display_name: string;
    created_at: string;
    updated_at: string;
}

// Create or update user profile in the users table
export async function createUserProfile(userId: string, displayName: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                display_name: displayName
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating/updating user profile:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('createUserProfile error:', error);
        return null;
    }
}

// Get user profile from the users table
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found - user hasn't completed onboarding yet
                return null;
            }
            console.error('Error fetching user profile:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('getUserProfile error:', error);
        return null;
    }
}

// Update user display name
export async function updateUserDisplayName(userId: string, displayName: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('users')
            .update({ display_name: displayName })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user display name:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('updateUserDisplayName error:', error);
        return false;
    }
}