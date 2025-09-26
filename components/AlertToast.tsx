import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface alert {
    alertTitle: string,
    alertDesc: string,
    visible: boolean,
    setVisible: (visible: boolean) => void
}

const AlertToast = ({ alertTitle, alertDesc, visible, setVisible }: alert) => {

    const handleAlert = () => {
        setVisible(false)
    }

    // Only render when visible is true
    if (!visible) return null;

    return (
        <View className='flex-1 absolute inset-0 justify-center items-center' style={{ zIndex: 999999, elevation: 999999 }}>
            {/* Background overlay */}
            <View className='absolute inset-0 bg-black/60' />
            
            {/* Alert box */}
            <View className='w-[85vw] bg-[#f9f7e7] rounded-[30px] p-6 mx-4 mt-10' style={{ minHeight: 150 }}>
                <View className='flex-1 justify-center items-start gap-3'>
                    <Text className='text-2xl font-alan-sans-medium text-[#191923]'>{alertTitle}</Text>
                    <Text className='text-base font-alan-sans-medium text-[#191923]/80 leading-5'>{alertDesc}</Text>
                </View>
                
                {/* OK Button */}
                <View className='w-full items-end mt-4'>
                    <TouchableOpacity
                        className='px-6 py-2 bg-[#283618] rounded-full'
                        onPress={handleAlert}
                    >
                        <Text className='text-lg font-alan-sans-medium text-[#f9f7e7]'>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default AlertToast