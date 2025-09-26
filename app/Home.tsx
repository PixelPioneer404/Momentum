import ModalPopup from '@/components/ModalPopup';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CheckedIcon from "../assets/icons/checked-icon.svg";
import PlusIcon from "../assets/icons/plus.svg";
import RightArrow from "../assets/icons/right-arrow.svg";
import SetingsIcon from "../assets/icons/settings-icon.svg";
import UnCheckedIcon from "../assets/icons/unchecked-icon.svg";

const Home = () => {

    interface Task {
        id: string,
        title: string,
        desc: string,
        date: string,
        completed: boolean
    }

    const [visible, setVisible] = useState(false)

    const [tasks, setTask] = useState<Task[]>([])

    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [date, setDate] = useState("")

    // Function to get the next available ID
    const getNextId = () => {
        if (tasks.length === 0) return '1';
        const maxId = Math.max(...tasks.map(task => parseInt(task.id)));
        return (maxId + 1).toString();
    }

    // Updated addTask function with auto-incrementing ID
    const addTask = (title: string, desc: string, date: string) => {
        const newTask: Task = {
            id: getNextId(),
            title,
            desc,
            date,
            completed: false
        };
        setTask([...tasks, newTask]);
    }

    const toggleTask = (taskID: string) => {
        let task = tasks.find(t => t.id === taskID)

        if (task && !task.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }

        setTask(tasks.map(task =>
            task.id === taskID
                ? { ...task, completed: !task.completed }
                : task
        ))
    }

    return (
        <View className='items-center relative flex-1 bg-[#ccd5ae]'>
            <ModalPopup
                visible={visible}
                setVisible={setVisible}
                title={title}
                setTitle={setTitle}
                desc={desc}
                setDesc={setDesc}
                date={date}
                setDate={setDate}
                addTask={addTask}
            />
            <TouchableOpacity
                className='absolute bottom-10 right-10 aspect-square w-[30vw] rounded-[40px] shadow-[0_4px_10px_20px_#000000] bg-[#283618] justify-center items-center'
                style={{ zIndex: 999 }}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    setTimeout(() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }, 50)
                    setVisible(true)
                }}
            >
                <PlusIcon height={50} width={50} color="#ccd5ae" strokeWidth={1.5} />
            </TouchableOpacity>
            <View className='absolute top-0 left-0 w-full h-[25vh] flex-row justify-between items-end px-8 bg-[#081c15] pb-8 rounded-b-[35px] z-999'>
                <View className='flex-col justify-center items-start'>
                    <Text className="text-[22px] font-alan-sans-medium text-[#ccd5ae]">Welcome,</Text>
                    <Text className="text-4xl font-alan-sans-medium text-[#f9f7e7]">Rajbeer Saha</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        setTimeout(() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }, 50)
                    }}
                >
                    <SetingsIcon width={40} height={40} />
                </TouchableOpacity>
            </View>
            <ScrollView
                className='relative mt-[25vh] w-full'
                style={{ zIndex: 1 }}
                contentContainerStyle={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: 24,
                    paddingHorizontal: 24
                }}
            >
                <View className='relative w-full h-[15vh] bg-[#3a2618] rounded-[35px] justify-center items-center'>
                    <TouchableOpacity
                        className='absolute bottom-5 right-5 aspect-square p-3 rounded-full shadow-2xl bg-[#ccd5ae] justify-center items-center'
                        style={{ zIndex: 999 }}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            setTimeout(() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            }, 50)
                        }}
                    >
                        <PlusIcon height={20} width={20} color="#000000" strokeWidth={4} />
                    </TouchableOpacity>
                    <Text className='text-gray-300/40 text-[15px] font-alan-sans-medium'>What&apos;s your most urgent task ?</Text>
                </View>
                <View className='w-full flex-col mt-4 gap-2'>
                    <View className='w-full items-center justify-start gap-4 mt-5 flex-row'>
                        <Text className='font-sans font-bold text-[#191923] text-[32px] ml-3'>Tasks</Text>
                        <View className='bg-black/20 h-0.5 w-[60vw] mt-2'></View>
                    </View>
                    <FlatList
                        data={tasks}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View className="w-full h-[4.8rem] justify-center items-start bg-white/80 rounded-[25px] px-6 mb-5 relative">
                                <View className='absolute top-1/2 -translate-y-1/2 right-4 flex-row gap-3 items-center'>
                                    <Text className='text-base font-alan-sans-medium text-black/50'>{item?.date}</Text>
                                    <TouchableOpacity
                                        className='p-2 rounded-full bg-[#ccd5ae]'
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                        }}
                                    >
                                        <RightArrow width={22} height={22} color='rgba(0,0,0,0.8)' />
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        className='flex-row gap-3'
                                        onPress={() => toggleTask(item.id)}
                                    >
                                        {item.completed ? <CheckedIcon width={28} height={28} /> : <UnCheckedIcon width={28} height={28} />}
                                        <Text className={`mt-0.5 text-xl font-alan-sans-medium text-[#283618]  ${item.completed ? "line-through" : ""}`}>{item.title}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        className="w-[100%] mt-3"
                        contentContainerStyle={{ paddingBottom: 24 }}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View className='flex-1 justify-center items-center h-[30vh]'>
                                <Text className='text-xl text-[#283618]/60 font-alan-sans-medium'>Click the + button to add a task</Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
    )
}

export default Home