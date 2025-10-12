// app/auth.tsx
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Give a short delay to allow the deep link handling in _layout.tsx
    // to process the authentication tokens, then let AppNavigator 
    // handle the proper routing based on auth state
    const timer = setTimeout(() => {
      // Don't redirect to a specific page, let AppNavigator decide
      // based on authentication state (index, onboarding, or home)
      router.replace('/');
    }, 1500); // 1.5 second delay to show loading and process auth

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ccd5ae" }}>
      <LottieView
        source={require('../assets/lottie/activity-indicator.json')}
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
}