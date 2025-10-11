// app/_layout.tsx
import { AuthContext, AuthProvider } from "@/contexts/AuthProvider";
import { UserProvider } from "@/contexts/UserContext";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../lib/supabase";
import "./global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// --- Handles conditional navigation based on auth state ---
function AppNavigator() {
  const { session, user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Debug logging
  console.log('AppNavigator - loading:', loading);
  console.log('AppNavigator - session:', !!session);
  console.log('AppNavigator - user:', !!user);
  console.log('AppNavigator - Should show:', (!session || !user) ? 'INDEX' : 'ONBOARDING');

  // Navigate based on auth state
  useEffect(() => {
    if (!loading) {
      if (session && user) {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = user.user_metadata?.onboarding_completed;
        if (hasCompletedOnboarding) {
          console.log('Navigating to Home...');
          router.replace('/Home');
        } else {
          console.log('Navigating to Onboarding...');
          router.replace('/Onboarding');
        }
      } else {
        console.log('Navigating to Index...');
        router.replace('/');
      }
    }
  }, [loading, session, user, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Onboarding" />
      <Stack.Screen name="Home" />
    </Stack>
  );
}

// --- Main layout component ---
export default function RootLayout() {
  const [loaded] = useFonts({
    "BobobyGroovy": require("../assets/fonts/bobogy-groofy.otf"),
    "AlanSansMedium": require("../assets/fonts/AlanSans-Medium.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep links for authentication
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.startsWith('momentum://auth')) {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.hash?.slice(1) || urlObj.search);
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          supabase.auth.setSession({
            access_token,
            refresh_token
          }).then(({ data, error }) => {
            if (error) {
              console.error('Session error:', error);
            } else {
              console.log('Session set successfully via deep link:', data);
            }
          });
        }
      }
    };

    // Web-specific URL handling
    const handleWebAuth = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('Detected auth tokens in URL hash:', hash);
          const params = new URLSearchParams(hash.slice(1));
          
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          
          if (access_token && refresh_token) {
            console.log('Setting session from URL tokens...');
            supabase.auth.setSession({
              access_token,
              refresh_token
            }).then(({ data, error }) => {
              if (error) {
                console.error('Session error:', error);
              } else {
                console.log('Session set successfully from URL:', data);
                // Clear the hash from URL after processing
                window.history.replaceState(null, '', window.location.pathname);
              }
            });
          }
        }
      }
    };

    // Handle web auth immediately
    handleWebAuth();

    // Handle the initial URL when app is launched (mobile)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running (mobile)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Listen for hash changes on web
    const handleHashChange = () => {
      handleWebAuth();
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      subscription?.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar hidden={true} />
          <AppNavigator />
        </GestureHandlerRootView>
      </UserProvider>
    </AuthProvider>
  );
}