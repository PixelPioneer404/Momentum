import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import LottieView from "lottie-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import GoogleIcon from "../assets/icons/google-icon.svg";

export default function App() {

  const router = useRouter()

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
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 50);
            router.push("/Home")
          }}
        >
          <View className="flex-1 flex-row justify-center items-center gap-3">
            <GoogleIcon width={24} height={24} />
            <Text className="text-[#ccd5ae] font-alan-sans-medium text-[1.4rem]">Log in with Google</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}