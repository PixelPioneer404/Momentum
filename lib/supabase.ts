import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Web-compatible storage adapter
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined') {
        const value = window.localStorage.getItem(key)
        console.log('getItem (web)', key, value);
        return value
      }
      return null
    }
    // Use SecureStore on native platforms
    const value = await SecureStore.getItemAsync(key)
    console.log('getItem (native)', key, value);
    return value
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value)
      }
      return
    }
    // Use SecureStore on native platforms
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      return
    }
    // Use SecureStore on native platforms
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        detectSessionInUrl: Platform.OS === 'web',
        autoRefreshToken: true,
        persistSession: true
    }
})