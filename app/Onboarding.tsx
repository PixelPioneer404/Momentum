import AlertToast from '@/components/AlertToast';
import { AuthContext } from '@/contexts/AuthProvider';
import { useUser } from '@/contexts/UserContext';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';
import { createUserProfile } from '../lib/userService';

const Onboarding = () => {
    const { setUserName } = useUser();
    const { user } = useContext(AuthContext);
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

    const handleContinue = async () => {
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

        if (!user?.id) {
            setToastTitle('Error');
            setToastDesc('User not found. Please try logging in again.');
            setToastVisible(true);
            return;
        }

        try {
            // 1. Save name to users table in Supabase
            const userProfile = await createUserProfile(user.id, name.trim());
            
            if (!userProfile) {
                setToastTitle('Error');
                setToastDesc('Failed to save your name. Please try again.');
                setToastVisible(true);
                return;
            }

            // 2. Update user metadata to mark onboarding as completed
            const { error } = await supabase.auth.updateUser({
                data: { 
                    onboarding_completed: true
                }
            });

            if (error) {
                console.error('Error updating user metadata:', error);
                setToastTitle('Error');
                setToastDesc('Failed to complete onboarding. Please try again.');
                setToastVisible(true);
                return;
            }

            // 3. Save the name to context for immediate use
            setUserName(name.trim());
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            console.log('Onboarding completed! User profile created:', userProfile);
            
            // Navigate to Home screen
            router.replace('/Home');
        } catch (error) {
            console.error('Error in handleContinue:', error);
            setToastTitle('Error');
            setToastDesc('Something went wrong. Please try again.');
            setToastVisible(true);
        }
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