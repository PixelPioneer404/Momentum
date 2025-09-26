import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PlusIcon from "../assets/icons/plus.svg";
import TaskIcon from "../assets/icons/task-icon.svg";
import AlertToast from './AlertToast';

interface TaskFields {
    visible: boolean,
    setVisible: (visible: boolean) => void
    title: string,
    setTitle: (title: string) => void
    desc: string,
    setDesc: (title: string) => void
    date: string,
    setDate: (title: string) => void,
    addTask: (title: string, desc: string, date: string) => void
}

const ModalPopup = ({ visible, setVisible, title, setTitle, desc, setDesc, date, setDate, addTask }: TaskFields) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState("")
    const [alertDesc, setAlertDesc] = useState("")

    const handleEmptyTaskField = () => {
        setAlertTitle("Missing Title")
        setAlertDesc("Please enter a task title to continue")
        setAlertVisible(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (selectedDate: Date) => {
        const formattedDate = selectedDate.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        setDate(formattedDate);
        hideDatePicker();
    };

    const clearDate = () => {
        setDate('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    return (
        <>
            <View className={`flex-1 absolute inset-0 bg-black/60 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-200 ease-in-out`} style={{ zIndex: 999 }} />
            <Modal
                animationType='slide'
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
                statusBarTranslucent={true}
            >
                <View
                    className='flex-1 absolute inset-0'
                    onTouchEnd={() => {
                        setVisible(false)
                        setTitle("")
                        setDesc("")
                        setDate("")
                    }}
                />
                <View className='flex-1 justify-end'>
                    <View
                        className='bg-[#a3b18a] shadow-[0_0_10px_black] rounded-t-[40px] flex-col'
                        style={{
                            maxHeight: keyboardHeight > 0 ? `${100 - (keyboardHeight / 8)}%` : '85%',
                            minHeight: '70%',
                            marginBottom: keyboardHeight > 0 ? keyboardHeight : 0
                        }}
                    >
                        {/* Header */}
                        <View className='p-8 pb-4'>
                            <View className='w-full h-[72px] bg-[#f9f7e7] rounded-[30px] flex-row gap-3 justify-center items-center relative'>
                                <View className='absolute left-5'>
                                    <TaskIcon width={40} height={40} />
                                </View>
                                <Text className='text-[2.8rem] font-alan-sans-medium text-[#283618]'>Add a task</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <ScrollView
                            className='flex-1'
                            contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 16 }}
                            keyboardShouldPersistTaps='handled'
                            showsVerticalScrollIndicator={false}
                        >
                            <View className='flex-col gap-4'>
                                <View className='w-full gap-2'>
                                    <Text className='text-[22px] font-alan-sans-medium text-[#191923] ml-3'>Title<Text className='text-red-700'>&nbsp;*</Text></Text>
                                    <TextInput
                                        className='text-base text-black/80 font-alan-sans-medium bg-[#f9f7e7] px-5 h-[50px] rounded-[25px]'
                                        placeholder="Complete maths homework"
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholderTextColor='rgba(25,25,35,0.4)'
                                    />
                                </View>
                                <View className='w-full gap-2'>
                                    <Text className='text-[22px] font-alan-sans-medium text-[#191923] ml-3'>Description</Text>
                                    <TextInput
                                        className='text-base text-black/80 font-alan-sans-medium bg-[#f9f7e7] px-5 pt-4 h-[150px] rounded-[25px]'
                                        placeholder="Solve the 3rd chapter"
                                        value={desc}
                                        onChangeText={setDesc}
                                        placeholderTextColor='rgba(25,25,35,0.4)'
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical='top'
                                    />
                                </View>
                                <View className='w-full gap-2'>
                                    <View className='flex-row items-center justify-between'>
                                        <Text className='text-[22px] font-alan-sans-medium text-[#191923] ml-3'>Due Date</Text>
                                        {date && (
                                            <TouchableOpacity
                                                onPress={clearDate}
                                                className='mr-3 px-3 py-1 bg-red-500/20 rounded-full'
                                            >
                                                <Text className='text-red-700 text-sm font-alan-sans-medium'>Clear</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        className='text-base text-black/80 font-alan-sans-medium bg-[#f9f7e7] px-5 h-[50px] rounded-[25px] justify-center'
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            showDatePicker();
                                        }}
                                    >
                                        <Text className={`text-base font-alan-sans-medium ${date ? 'text-black/80' : 'text-black/40'
                                            }`}>
                                            {date || 'Select due date'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Date Picker Modal */}
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                            minimumDate={new Date()}
                            // Available styling options
                            textColor="#283618"              // Main text color
                            accentColor="#283618"            // Accent/selection color
                            confirmTextIOS="Confirm"         // iOS confirm button text
                            cancelTextIOS="Cancel"           // iOS cancel button text
                            buttonTextColorIOS="#283618"     // Button text color
                        />

                        <View className='p-8 pt-4'>
                            <TouchableOpacity
                                className='w-full h-[72px] bg-[#283618] rounded-[30px] justify-center items-center gap-2 flex-row'
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                    if (title.trim()) {
                                        addTask(title, desc, date)
                                        setVisible(false)
                                        setTitle("")
                                        setDesc("")
                                        setDate("")
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                                    } else {
                                        handleEmptyTaskField();
                                    }
                                }}
                            >
                                <PlusIcon width={24} height={24} color='#f9f7e7' strokeWidth={2} />
                                <Text className='text-[#f9f7e7]/80 font-alan-sans-medium text-3xl'>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* AlertToast - Inside Modal so it appears on top of modal content */}
                {alertVisible && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        elevation: 9999
                    }}>
                        <AlertToast
                            alertTitle={alertTitle}
                            alertDesc={alertDesc}
                            visible={alertVisible}
                            setVisible={setAlertVisible}
                        />
                    </View>
                )}
            </Modal>
        </>
    )
}

export default ModalPopup