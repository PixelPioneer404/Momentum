import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import LottieView from "lottie-react-native";
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import GoogleIcon from "../assets/icons/google-icon.svg";
import AlertToast from "../components/AlertToast";
import { signInWithGoogle } from "../lib/auth";
import { isDevelopmentMode } from "../lib/devConfig";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Check if development mode is enabled
      if (isDevelopmentMode()) {
        console.log('🚧 Development mode enabled - bypassing authentication');
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        router.push('/Onboarding');
        return;
      }
      
      await signInWithGoogle();
      setIsLoading(false);
      // Navigation will be handled by the AuthProvider and _layout.tsx
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      setAlertTitle('Login Failed');
      setAlertDesc('Something went wrong. Please try again later.');
      setAlertVisible(true);
    }
  };

  return (
    <View className="flex-1 items-center bg-[#ccd5ae]">
      <View className="items-center mt-[6rem]">
        <LottieView
          source={require("../assets/lottie/TaskLottieLogin.json")}
          style={{ width: 370, height: 370 }}
          autoPlay
          loop
          speed={1.2}
        />
      </View>
      <View className="justify-center mt-6 flex-col items-center text-center">
        <Text className="text-[2rem] font-alan-sans-medium text-[#191923] text-center">Welcome to</Text>
        <Text className="text-[5rem] font-bobogy text-[#191923] text-center mt-[-15px]">Momentum</Text>
      </View>
      <View className="justify-center items-center mt-[120px]">
        <TouchableOpacity
          className="w-[70vw] h-[70px] bg-[#283618] rounded-3xl"
          style={{
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8, // For Android
            opacity: isLoading ? 0.7 : 1
          }}
          onPress={() => {
            if (!isLoading) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }, 50);
              handleGoogleLogin();
            }
          }}
          disabled={isLoading}
        >
          <View className="flex-1 flex-row justify-center items-center gap-3">
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ccd5ae" />
                <Text className="text-[#ccd5ae] font-alan-sans-medium text-[1.4rem]">Signing in...</Text>
              </View>
            ) : (
              <>
                <GoogleIcon width={24} height={24} />
                <Text className="text-[#ccd5ae] font-alan-sans-medium text-[1.4rem]">Log in with Google</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* AlertToast for error handling */}
      <AlertToast
        alertTitle={alertTitle}
        alertDesc={alertDesc}
        visible={alertVisible}
        setVisible={setAlertVisible}
      />
    </View>
  );
}