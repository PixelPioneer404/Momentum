import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PencilIcon from '../assets/icons/pencil-icon.svg';

interface TaskPrint {
  taskId: string,
  title: string,
  date: string,
  desc: string,
  isMarked: boolean,
  toggleTask: (taskId: string) => void,
  visible: boolean,
  onClose: () => void,
  openEditMode: () => void
}

const TaskView = ({ taskId, title, date, desc, isMarked, toggleTask, visible, onClose, openEditMode }: TaskPrint) => {

  if (!visible) return null;

  const handleBackgroundPress = () => {
    onClose();
  };

  const handleModalPress = (event: any) => {
    // Prevent event from bubbling to background
    event.stopPropagation();
  };

  return (
    <TouchableOpacity
      className='flex-1 justify-center items-center absolute inset-0 bg-black/60'
      style={{ zIndex: 9999 }}
      activeOpacity={1}
      onPress={handleBackgroundPress}
    >
      <TouchableOpacity
        className='w-[85vw] h-[50vh] rounded-[40px] shadow-2xl bg-[#ccd5ae] relative'
        activeOpacity={1}
        onPress={handleModalPress}
      >
        {/* Edit Button */}
        <TouchableOpacity
          className='absolute top-5 right-5 rounded-full shadow-xl p-3 bg-[#283618] z-10'
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            console.log('Edit button pressed for task:', { taskId, title, date, desc })
            openEditMode()
          }}
        >
          <PencilIcon width={24} height={24} color='#f9f7e7' />
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity
          className='absolute bottom-5 right-5 rounded-full bg-red-600 px-6 py-3 z-10'
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            onClose()
          }}
        >
          <Text className='text-lg font-alan-sans-medium text-white'>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='absolute bottom-5 left-5 rounded-full bg-[#283618] px-6 py-3 z-10'
          onPress={() => {
            toggleTask(taskId);
            onClose();
          }}
        >
          <Text className='text-lg font-alan-sans-medium text-[#f9f7e7]'>{isMarked ? "Mark as undone" : "Mark as done"}</Text>
        </TouchableOpacity>

        {/* Content ScrollView */}
        <ScrollView
          className='flex-1 rounded-[40px] px-8 py-16'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Task Title */}
          <View className='mb-6'>
            <Text className='text-sm font-alan-sans-medium text-[#283618]/60 mb-2'>TITLE</Text>
            <Text
              className='text-2xl font-alan-sans-medium text-[#283618] leading-8'
              style={{ flexWrap: 'wrap' }}
            >
              {title}
            </Text>
          </View>

          {/* Due Date */}
          {date && (
            <View className='mb-6'>
              <Text className='text-sm font-alan-sans-medium text-[#283618]/60 mb-2'>DUE DATE</Text>
              <Text className='text-lg font-alan-sans-medium text-[#283618]'>
                {date}
              </Text>
            </View>
          )}

          {/* Description */}
          {desc ? (
            <View className='mb-6'>
              <Text className='text-sm font-alan-sans-medium text-[#283618]/60 mb-2'>DESCRIPTION</Text>
              <Text
                className='text-base font-alan-sans-medium text-[#283618]/80 leading-6'
                style={{ flexWrap: 'wrap' }}
              >
                {desc}
              </Text>
            </View>
          ) : (
            <View className='mb-6'>
              <Text className='text-sm font-alan-sans-medium text-[#283618]/60 mb-2'>DESCRIPTION</Text>
              <Text className='text-base font-alan-sans-medium text-[#283618]/40 italic'>
                No description provided
              </Text>
            </View>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default TaskView