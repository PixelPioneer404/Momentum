import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import { supabase } from './supabase';

// Complete the OAuth flow for Expo
WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
    try {
        console.log('Starting Google OAuth...');

        if (Platform.OS === 'web') {
            // For web platform
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });

            if (error) {
                console.error('OAuth error:', error);
                throw error;
            }
            
            console.log('OAuth successful:', data);
            return data;
        } else {
            // For mobile platforms (React Native)
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'momentum://auth',
                    skipBrowserRedirect: true
                }
            });

            if (error) {
                console.error('OAuth error:', error);
                throw error;
            }

            // Open the auth URL in the browser for mobile
            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    'momentum://auth'
                );
                
                console.log('WebBrowser result:', result);
                
                if (result.type === 'success' && result.url) {
                    // Extract the tokens from the redirect URL
                    const url = new URL(result.url);
                    const params = new URLSearchParams(url.hash.slice(1)); // Remove the # and parse
                    
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');
                    
                    if (access_token && refresh_token) {
                        // Set the session in Supabase
                        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        });
                        
                        if (sessionError) {
                            console.error('Session error:', sessionError);
                            throw sessionError;
                        }
                        
                        console.log('Session set successfully:', sessionData);
                        return sessionData;
                    }
                }
            }
            
            console.log('OAuth successful:', data);
            return data;
        }
    } catch (error) {
        console.error('signInWithGoogle error:', error);
        throw error;
    }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}