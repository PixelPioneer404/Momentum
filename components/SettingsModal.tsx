import { AuthContext } from '@/contexts/AuthProvider';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useContext, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PlusIcon from "../assets/icons/plus.svg";
import { signOut } from '../lib/auth';
import { getTaskStatistics } from '../lib/taskService';
import { getUserProfile, updateUserDisplayName } from '../lib/userService';

interface SettingsModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

const SettingsModal = ({ visible, setVisible }: SettingsModalProps) => {
    const { user } = useContext(AuthContext);
    const [displayName, setDisplayName] = useState<string>('');
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>('');
    const [tasksCreatedToday, setTasksCreatedToday] = useState<number>(0);
    const [tasksCompletedToday, setTasksCompletedToday] = useState<number>(0);
    const [totalTasks, setTotalTasks] = useState<number>(0);
    const [completedTasks, setCompletedTasks] = useState<number>(0);

    // Fetch user data and statistics
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id && visible) {
                try {
                    // Fetch user profile
                    const profile = await getUserProfile(user.id);
                    if (profile?.display_name) {
                        setDisplayName(profile.display_name);
                    }

                    // Fetch task statistics
                    const stats = await getTaskStatistics(user.id);
                    setTasksCreatedToday(stats.tasksCreatedToday);
                    setTasksCompletedToday(stats.tasksCompletedToday);
                    setTotalTasks(stats.totalTasks);
                    setCompletedTasks(stats.completedTasks);

                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [user?.id, visible]);

    const handleLogout = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
            console.log('Successfully signed out');
            setVisible(false);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const handleEditName = () => {
        setEditedName(displayName);
        setIsEditingName(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSaveName = async () => {
        if (!user?.id || !editedName.trim()) return;
        
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const success = await updateUserDisplayName(user.id, editedName.trim());
            
            if (success) {
                setDisplayName(editedName.trim());
                setIsEditingName(false);
            } else {
                Alert.alert('Error', 'Failed to update display name. Please try again.');
            }
        } catch (error) {
            console.error('Error updating display name:', error);
            Alert.alert('Error', 'Failed to update display name. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditedName('');
        setIsEditingName(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const closeModal = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVisible(false);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
        >
            <Pressable 
                className="flex-1 bg-black/50 justify-center items-center px-4"
                onPress={closeModal}
            >
                <Pressable 
                    className="w-[90vw] max-w-[400px] bg-[#f9f7e7] rounded-[30px] p-6 relative"
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <TouchableOpacity
                        className="absolute top-4 right-4 w-10 h-10 bg-[#ccd5ae] rounded-full justify-center items-center z-10"
                        onPress={closeModal}
                    >
                        <PlusIcon 
                            width={20} 
                            height={20} 
                            color="#283618" 
                            strokeWidth={3}
                            style={{ transform: [{ rotate: '45deg' }] }}
                        />
                    </TouchableOpacity>

                    {/* Settings Title */}
                    <Text className="text-[28px] font-alan-sans-medium text-[#283618] text-center mb-6 mt-2">
                        Settings
                    </Text>

                    {/* User Profile Section */}
                    <View className="flex-row items-center mb-8 bg-[#ccd5ae]/30 rounded-[20px] p-4">
                        <LottieView
                            source={require("../assets/lottie/profile-male.json")}
                            style={{ width: 56, height: 56 }}
                            autoPlay
                            loop
                            speed={1.2}
                        />
                        <View className="ml-4 flex-1">
                            {isEditingName ? (
                                <View>
                                    <TextInput
                                        value={editedName}
                                        onChangeText={setEditedName}
                                        className="text-[24px] font-alan-sans-medium text-[#283618] border-b border-[#283618] pb-1"
                                        placeholder="Enter display name"
                                        autoFocus
                                        maxLength={30}
                                    />
                                    <View className="flex-row mt-2 space-x-2">
                                        <TouchableOpacity
                                            onPress={handleSaveName}
                                            className="bg-[#283618] px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-[12px] font-alan-sans-medium text-[#f9f7e7]">
                                                SAVE
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleCancelEdit}
                                            className="bg-[#ccd5ae] px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-[12px] font-alan-sans-medium text-[#283618]">
                                                CANCEL
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[24px] font-alan-sans-medium text-[#283618]">
                                        {displayName || 'User'}
                                    </Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-[16px] font-alan-sans-medium text-[#283618]/60">
                                            {user?.email}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={handleEditName}
                                            className="bg-[#283618] px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-[12px] font-alan-sans-medium text-[#f9f7e7]">
                                                EDIT
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Overview Section */}
                    <View className="mb-8">
                        <Text className="text-[20px] font-alan-sans-medium text-[#283618] mb-4">
                            Overview
                        </Text>
                        
                        <View className="bg-[#081c15] rounded-[20px] p-4">
                            {/* Today's Stats */}
                            <View className="bg-[#ccd5ae]/20 rounded-[15px] p-3">
                                <Text className="text-[16px] font-alan-sans-medium text-[#ccd5ae] mb-2">
                                    Today&apos;s Activity
                                </Text>
                                <View className="flex-row justify-between">
                                    <View className="items-center">
                                        <Text className="text-[24px] font-alan-sans-medium text-[#f9f7e7]">
                                            {tasksCreatedToday}
                                        </Text>
                                        <Text className="text-[12px] font-alan-sans-medium text-[#ccd5ae]/80">
                                            Created
                                        </Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-[24px] font-alan-sans-medium text-[#f9f7e7]">
                                            {tasksCompletedToday}
                                        </Text>
                                        <Text className="text-[12px] font-alan-sans-medium text-[#ccd5ae]/80">
                                            Completed
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Overall Stats */}
                            <View className="bg-[#ccd5ae]/20 rounded-[15px] p-3">
                                <Text className="text-[16px] font-alan-sans-medium text-[#ccd5ae] mb-2">
                                    Overall Progress
                                </Text>
                                <View className="flex-row justify-between">
                                    <View className="items-center">
                                        <Text className="text-[24px] font-alan-sans-medium text-[#f9f7e7]">
                                            {totalTasks}
                                        </Text>
                                        <Text className="text-[12px] font-alan-sans-medium text-[#ccd5ae]/80">
                                            Total Tasks
                                        </Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-[24px] font-alan-sans-medium text-[#f9f7e7]">
                                            {completedTasks}
                                        </Text>
                                        <Text className="text-[12px] font-alan-sans-medium text-[#ccd5ae]/80">
                                            Completed
                                        </Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-[24px] font-alan-sans-medium text-[#f9f7e7]">
                                            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                                        </Text>
                                        <Text className="text-[12px] font-alan-sans-medium text-[#ccd5ae]/80">
                                            Success
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        className="bg-[#283618] rounded-[20px] p-4 mb-4"
                        onPress={handleLogout}
                    >
                        <Text className="text-[18px] font-alan-sans-medium text-[#f9f7e7] text-center">
                            Logout
                        </Text>
                    </TouchableOpacity>

                    {/* Developer Shoutout */}
                    <View className="bg-[#ccd5ae]/30 rounded-[15px] p-3 items-center">
                        <Text className="text-[14px] font-alan-sans-medium text-[#283618]/80 text-center">
                            Created with ❤️ by 
                        </Text>
                        <Text className="text-[16px] font-alan-sans-medium text-[#283618] text-center">
                            Rajbeer Saha
                        </Text>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default SettingsModal;