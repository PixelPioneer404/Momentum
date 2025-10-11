import ModalPopup from '@/components/ModalPopup';
import TaskView from '@/components/TaskView';
import { AuthContext } from '@/contexts/AuthProvider';
import { useUser } from '@/contexts/UserContext';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatlist, { RenderItemParams } from "react-native-draggable-flatlist";
import SwipeableItem, { UnderlayParams } from "react-native-swipeable-item";
import CheckedIcon from "../assets/icons/checked-icon.svg";
import DeleteBtn from "../assets/icons/delete-icon.svg";
import PlusIcon from "../assets/icons/plus.svg";
import RightArrow from "../assets/icons/right-arrow.svg";
import SetingsIcon from "../assets/icons/settings-icon.svg";
import UnCheckedIcon from "../assets/icons/unchecked-icon.svg";
import { signOut } from '../lib/auth';
import {
    createTask as createTaskDB,
    Task as DBTask,
    deleteTask as deleteTaskDB,
    getNextTaskOrder,
    getUserTasks,
    toggleTaskCompletion,
    updateTask as updateTaskDB,
    updateTasksOrder
} from '../lib/taskService';
import { getUserProfile } from '../lib/userService';

export interface Task {
    id: string,
    title: string,
    desc: string,
    date: string,
    completed: boolean,
    order: number
}

// Helper function to convert DB task to UI task format
const dbTaskToUITask = (dbTask: DBTask): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    desc: dbTask.description,
    date: dbTask.due_date,
    completed: dbTask.completed,
    order: dbTask.task_order
});

const Home = () => {
    const { userName, setUserName } = useUser();
    const { user } = useContext(AuthContext);
    
    // State for display name from database
    const [displayName, setDisplayName] = useState<string>('');
    const [tasksLoading, setTasksLoading] = useState<boolean>(true);
    
    // Debug: Show user ID for testing authentication persistence
    console.log('Home - Current User ID:', user?.id);
    console.log('Home - User Email:', user?.email);
    
    // Fetch user's display name from database when component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user?.id) {
                try {
                    const profile = await getUserProfile(user.id);
                    if (profile?.display_name) {
                        setDisplayName(profile.display_name);
                        setUserName(profile.display_name); // Update context as well
                        console.log('Fetched display name from database:', profile.display_name);
                    } else {
                        console.log('No display name found in database');
                        setDisplayName('User'); // Fallback
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setDisplayName('User'); // Fallback
                }
            }
        };

        fetchUserProfile();
    }, [user?.id, setUserName]);

    // Fetch user's tasks from database when component mounts
    useEffect(() => {
        const fetchTasks = async () => {
            if (user?.id) {
                setTasksLoading(true);
                try {
                    const dbTasks = await getUserTasks(user.id);
                    const uiTasks = dbTasks.map(dbTaskToUITask);
                    setTask(uiTasks);
                    console.log('Fetched tasks from database:', uiTasks.length);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                } finally {
                    setTasksLoading(false);
                }
            }
        };

        fetchTasks();
    }, [user?.id]);
    
    const [visible, setVisible] = useState(false)
    const [taskViewVisible, setTaskViewVisible] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const [isEditing, setIsEditing] = useState(false)

    const [tasks, setTask] = useState<Task[]>([])

    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [date, setDate] = useState("")

    // Memoized sorted tasks to prevent unnecessary re-renders
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => a.order - b.order);
    }, [tasks]);

    // Updated addTask function to save to database
    const addTask = async (title: string, desc: string, date: string) => {
        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        try {
            const nextOrder = await getNextTaskOrder(user.id);
            const taskData = {
                title,
                description: desc,
                due_date: date,
                task_order: nextOrder
            };

            const newDBTask = await createTaskDB(user.id, taskData);
            if (newDBTask) {
                const newUITask = dbTaskToUITask(newDBTask);
                setTask([...tasks, newUITask]);
                console.log('Task created successfully:', newUITask);
            } else {
                console.error('Failed to create task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const editTask = async (taskID: string, title: string, desc: string, date: string) => {
        try {
            const updates = {
                title,
                description: desc,
                due_date: date
            };

            const updatedDBTask = await updateTaskDB(taskID, updates);
            if (updatedDBTask) {
                const updatedUITask = dbTaskToUITask(updatedDBTask);
                setTask(tasks.map(task =>
                    task.id === taskID ? updatedUITask : task
                ));
                console.log('Task updated successfully:', updatedUITask);
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    const toggleTask = async (taskID: string) => {
        let task = tasks.find(t => t.id === taskID);

        if (task && !task.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        if (task) {
            try {
                const newCompletedState = !task.completed;
                const updatedDBTask = await toggleTaskCompletion(taskID, newCompletedState);
                
                if (updatedDBTask) {
                    const updatedUITask = dbTaskToUITask(updatedDBTask);
                    setTask(tasks.map(t =>
                        t.id === taskID ? updatedUITask : t
                    ));
                    console.log('Task completion toggled:', updatedUITask);
                } else {
                    console.error('Failed to toggle task completion');
                }
            } catch (error) {
                console.error('Error toggling task:', error);
            }
        }
    };

    const openTaskView = (item: Task) => {
        setSelectedTask(item)
        setTaskViewVisible(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const closeTaskView = () => {
        setTaskViewVisible(false)
        setSelectedTask(null)
    }

    const openEditMode = () => {
        console.log('Opening edit mode for task:', selectedTask)
        setIsEditing(true)
        setVisible(true)
        setTaskViewVisible(false) // Close TaskView but keep selectedTask
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    // Delete task function
    const deleteTask = async (taskId: string) => {
        try {
            const success = await deleteTaskDB(taskId);
            if (success) {
                setTask(tasks.filter(task => task.id !== taskId));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                console.log('Task deleted successfully:', taskId);
            } else {
                console.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Right swipe reveals delete button (swipe right to delete)
    const renderUnderlayRight = ({ item }: UnderlayParams<Task>) => (
        <TouchableOpacity
            className='bg-red-500 aspect-square h-[4.8rem] rounded-[20px] justify-center items-center shadow-xl ml-2'
            onPress={() => deleteTask(item.id)}
        >
            <DeleteBtn width={24} height={24} color='white' />
        </TouchableOpacity>
    )

    const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
        <SwipeableItem
            key={item.id}
            item={item}
            overSwipe={20}
            renderUnderlayRight={renderUnderlayRight}
            snapPointsRight={[90]}
            activationThreshold={5}
            swipeEnabled={true}
        >
            <Pressable
                className={`w-full h-[4.8rem] justify-center items-start rounded-[25px] px-6 mb-5 relative ${isActive ? 'bg-white/40 scale-90' : 'bg-white scale-100'} transition-all duration-300 ease-in-out`}
                onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    drag()
                }}
                onPress={() => openTaskView(item)}
            >
                <View className='absolute top-1/2 -translate-y-1/2 right-4 flex-row gap-3 items-center'>
                    <Text className='text-base font-alan-sans-medium text-black/50'>{item?.date}</Text>
                    <TouchableOpacity
                        className='p-2 rounded-full bg-[#ccd5ae]'
                        onPress={(e) => {
                            e.stopPropagation()
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            openTaskView(item)
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
            </Pressable>
        </SwipeableItem>
    )

    return (
        <View className='items-center relative flex-1 bg-[#ccd5ae]'>
            {/* TaskView - Conditional rendering */}
            {taskViewVisible && selectedTask && (
                <TaskView
                    taskId={selectedTask.id}
                    title={selectedTask.title}
                    date={selectedTask.date}
                    desc={selectedTask.desc}
                    isMarked={selectedTask.completed}
                    toggleTask={toggleTask}
                    visible={taskViewVisible}
                    onClose={closeTaskView}
                    openEditMode={openEditMode}
                />
            )}

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
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
                editTask={editTask}
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
            <View className='absolute top-0 left-0 flex-1 w-[100vw] h-[100vh] flex-col'>
                <View className='w-full h-[25vh] flex-row justify-between items-end px-6 bg-[#081c15] pb-8 rounded-b-[35px] z-999'>
                    <View className='flex-row justify-center items-center gap-3'>
                        <LottieView
                            source={require("../assets/lottie/profile-male.json")}
                            style={{ width: 56, height: 56 }}
                            autoPlay
                            loop
                            speed={1.2}
                        />
                        <View className='flex-col justify-center items-start'>
                            <Text className="text-[22px] font-alan-sans-medium text-[#ccd5ae]">Welcome,</Text>
                            <Text className="text-4xl font-alan-sans-medium text-[#f9f7e7]">{displayName || userName || 'User'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            setTimeout(() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            }, 50)
                            
                            // Logout functionality for testing
                            try {
                                await signOut();
                                console.log('Successfully signed out');
                            } catch (error) {
                                console.error('Sign out error:', error);
                            }
                        }}
                    >
                        <SetingsIcon width={40} height={40} />
                    </TouchableOpacity>
                </View>
                <View
                    className='relative w-[100%] flex-1 flex-col items-center justify-start px-8'
                    style={{ zIndex: 1 }}
                >
                    <DraggableFlatlist
                        data={sortedTasks}
                        keyExtractor={item => item.id}
                        onDragEnd={async ({ data }) => {
                            // Reassign order based on new positions and update state
                            const reorderedTasks = data.map((task: Task, index: number) => ({ ...task, order: index }));
                            setTask(reorderedTasks);
                            
                            // Update order in database
                            try {
                                const orderUpdates = reorderedTasks.map(task => ({
                                    id: task.id,
                                    task_order: task.order
                                }));
                                
                                const success = await updateTasksOrder(orderUpdates);
                                if (success) {
                                    console.log('Task order updated successfully');
                                } else {
                                    console.error('Failed to update task order');
                                }
                            } catch (error) {
                                console.error('Error updating task order:', error);
                            }
                        }}
                        ListHeaderComponent={
                            <View className='flex-col w-full gap-4 mb-[24px] mt-[24px]'>
                                <View className='relative w-[90vw] h-[15vh] bg-[#3a2618] rounded-[35px] justify-center items-center'>
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
                                <View className='w-full items-center justify-start gap-4 mt-5 flex-row'>
                                    <Text className='font-sans font-bold text-[#191923] text-[32px] ml-3'>Tasks</Text>
                                    <View className='bg-black/20 h-0.5 w-[60vw] mt-2'></View>
                                </View>
                            </View>
                        }
                        renderItem={renderItem}
                        className="w-full"
                        contentContainerStyle={{ paddingBottom: 160, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                        ListEmptyComponent={
                            tasksLoading ? (
                                // Show loading indicator while fetching tasks
                                <View className='flex-1 justify-center items-center h-[20vh] mt-[-40px]'>
                                    <ActivityIndicator size="large" color="#283618" />
                                    <Text className='text-lg text-[#283618]/60 font-alan-sans-medium mt-4'>Loading your tasks...</Text>
                                </View>
                            ) : (
                                // Show empty state only when loading is complete and no tasks exist
                                <View className='flex-1 justify-center items-center h-[20vh] mt-[-40px]'>
                                    <LottieView
                                        source={require("../assets/lottie/empty-task.json")}
                                        style={{ width: 250, height: 250, opacity: 0.6 }}
                                        autoPlay
                                        loop
                                        speed={1.0}
                                    />
                                    <Text className='text-xl text-[#283618]/60 font-alan-sans-medium mt-[-40px]'>Click the + button to add a task</Text>
                                </View>
                            )
                        }
                    />
                </View>
            </View>
        </View>
    )
}

export default Home