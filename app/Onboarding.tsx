import AlertToast from '@/components/AlertToast';
import { useUser } from '@/contexts/UserContext';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const Onboarding = () => {
    const { setUserName } = useUser();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [toastTitle, setToastTitle] = useState('');
    const [toastDesc, setToastDesc] = useState('');
    const maxLength = 20;

    const handleNameChange = (text: string) => {
        setName(text);
        if (text.length > maxLength) {
            setError(`Name cannot exceed ${maxLength} characters`);
            // Don't show toast for character limit - just show error message below
        } else {
            setError('');
        }
    };

    const handleContinue = () => {
        if (name.trim() === '') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            setToastTitle('Input Required');
            setToastDesc('Please enter your name to continue');
            setToastVisible(true);
            return;
        }

        if (name.length > maxLength) {
            return; // Don't proceed if over limit
        }

        // Save the name to context before navigating
        setUserName(name.trim());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Navigate to Home screen
        router.replace('/Home');
    };

    // Check if continue button should be disabled
    const isContinueDisabled = name.length > maxLength;
    return (
        <View className='relative flex-1 bg-[#ccd5ae]'>
            <View className='w-full justify-end items-center absolute top-0 left-0 '>
                <LottieView
                    source={require("../assets/lottie/onboarding.json")}
                    style={{ width: 480, height: 480 }}
                    autoPlay
                    loop
                    speed={1.2}
                />
            </View>
            <View className='w-full h-[50vh] absolute bottom-6 p-6 justify-start items-center gap-12'>
                <View className='w-[90vw] relative'>
                    <TextInput
                        className='w-full h-[72px] border-2 border-[#283618] rounded-[30px] px-6 pr-20 text-xl font-alan-sans-medium'
                        placeholder='Enter your name'
                        value={name}
                        onChangeText={handleNameChange}
                        maxLength={maxLength + 5} // Allow a bit over to show error
                    />
                    {/* Character counter */}
                    <View className='absolute right-4 h-[72px] justify-center items-center'>
                        <Text className={`text-base font-alan-sans-medium ${name.length > maxLength ? 'text-[#283618]/80' : 'text-[#283618]/60'}`}>
                            {name.length}/{maxLength}
                        </Text>
                    </View>
                    {/* Error message - always reserve space */}
                    <View className='h-6 mt-2 ml-2'>
                        {error ? (
                            <Text className='text-red-500 text-sm font-alan-sans-medium'>
                                {error}
                            </Text>
                        ) : null}
                    </View>
                </View>
                <TouchableOpacity
                    className='mx-auto px-10 py-4 rounded-[30px] bg-[#283618] relative z-10'
                    style={{ opacity: isContinueDisabled ? 0.6 : 1 }}
                    onPress={handleContinue}
                    disabled={isContinueDisabled}
                >
                    <Text className='text-[20px] font-alan-sans-medium text-[#f9f7e7]'>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* AlertToast */}
            <AlertToast
                alertTitle={toastTitle}
                alertDesc={toastDesc}
                visible={toastVisible}
                setVisible={setToastVisible}
            />
            {/* <View className='absolute bottom-10 left-1/2 -translate-x-1/2 w-[85vw] h-[20vh] bg-white/50 rounded-[50px] justify-center items-center'>
                
            </View> */}
            <View className='absolute -bottom-[160px] -left-20 z-9'>
                <LottieView
                    source={require("../assets/lottie/grass-illus.json")}
                    style={{ width: 650, height: 650 }}
                    autoPlay
                    loop
                    speed={1.2}
                />
            </View>
        </View>
    )
}

export default Onboarding