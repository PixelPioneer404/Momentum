// Development-friendly service wrappers
// These functions will return mock data or no-op in development mode

import { isDevelopmentMode } from './devConfig';
import * as taskService from './taskService';
import * as urgentTaskService from './urgentTaskService';
import * as userService from './userService';

// Dynamic mock data tracking for development
let mockTaskCounter = 0;
let mockTasks: taskService.Task[] = [];
let mockTasksCreatedToday = 0;
let mockTasksCompletedToday = 0;

// Initialize with some sample data
const initializeMockTasks = () => {
  const today = new Date().toISOString();
  mockTasks = [
    {
      id: 'task-1',
      user_id: 'dev-user-123',
      title: 'Sample Task 1',
      description: 'This is a sample task for development',
      due_date: new Date().toISOString().split('T')[0],
      completed: false,
      task_order: 0,
      created_at: today,
      updated_at: today
    },
    {
      id: 'task-2',
      user_id: 'dev-user-123',
      title: 'Completed Task',
      description: 'This task is already completed',
      due_date: new Date().toISOString().split('T')[0],
      completed: true,
      task_order: 1,
      created_at: today,
      updated_at: today
    }
  ];
  mockTasksCreatedToday = 2;
  mockTasksCompletedToday = 1;
  mockTaskCounter = 2;
};

// Initialize mock data
initializeMockTasks();

const MOCK_URGENT_TASK: urgentTaskService.UrgentTask = {
  id: 'urgent-1',
  user_id: 'dev-user-123',
  title: 'Important Dev Task',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_USER_PROFILE: userService.UserProfile = {
  id: 'dev-user-123',
  display_name: 'Developer User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Task Service Wrappers
export const getUserTasks = async (userId: string): Promise<taskService.Task[]> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Returning mock tasks');
    return Promise.resolve(mockTasks);
  }
  return taskService.getUserTasks(userId);
};

export const createTask = async (userId: string, taskData: taskService.CreateTaskData): Promise<taskService.Task | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock creating task', taskData.title);
    mockTaskCounter++;
    const mockTask: taskService.Task = {
      id: `task-${mockTaskCounter}`,
      user_id: userId,
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date,
      completed: false,
      task_order: taskData.task_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTasks.push(mockTask);
    mockTasksCreatedToday++; // Increment today's created count
    console.log('🎯 Mock task created, today count:', mockTasksCreatedToday);
    return Promise.resolve(mockTask);
  }
  return taskService.createTask(userId, taskData);
};

export const updateTask = async (taskId: string, updates: taskService.UpdateTaskData): Promise<taskService.Task | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock updating task', taskId, updates);
    return Promise.resolve(null); // Return null to indicate success without actual data
  }
  return taskService.updateTask(taskId, updates);
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock deleting task', taskId);
    return Promise.resolve(true);
  }
  return taskService.deleteTask(taskId);
};

export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<taskService.Task | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock toggling task completion', taskId, completed);
    
    // Find and update the task in our mock data
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const wasCompleted = mockTasks[taskIndex].completed;
      mockTasks[taskIndex].completed = completed;
      mockTasks[taskIndex].updated_at = new Date().toISOString();
      
      // Track completion stats
      if (!wasCompleted && completed) {
        mockTasksCompletedToday++; // Task was just completed
        console.log('🎯 Mock task completed, today count:', mockTasksCompletedToday);
      } else if (wasCompleted && !completed) {
        mockTasksCompletedToday = Math.max(0, mockTasksCompletedToday - 1); // Task was uncompleted
        console.log('🎯 Mock task uncompleted, today count:', mockTasksCompletedToday);
      }
      
      return Promise.resolve(mockTasks[taskIndex]);
    }
    
    return Promise.resolve(null);
  }
  return taskService.toggleTaskCompletion(taskId, completed);
};

export const updateTasksOrder = async (tasks: { id: string; task_order: number }[]): Promise<boolean> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock updating tasks order', tasks.length, 'tasks');
    return Promise.resolve(true);
  }
  return taskService.updateTasksOrder(tasks);
};

export const getNextTaskOrder = async (userId: string): Promise<number> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock getting next task order');
    return Promise.resolve(mockTasks.length);
  }
  return taskService.getNextTaskOrder(userId);
};

export const getTaskStatistics = async (userId: string, date?: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  tasksCreatedToday: number;
  tasksCompletedToday: number;
}> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Returning dynamic mock task statistics');
    return Promise.resolve({
      totalTasks: mockTasks.length,
      completedTasks: mockTasks.filter((t: taskService.Task) => t.completed).length,
      tasksCreatedToday: mockTasksCreatedToday,
      tasksCompletedToday: mockTasksCompletedToday
    });
  }
  return taskService.getTaskStatistics(userId, date);
};

// Urgent Task Service Wrappers
export const getUserUrgentTask = async (userId: string): Promise<urgentTaskService.UrgentTask | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Returning mock urgent task');
    return Promise.resolve(MOCK_URGENT_TASK);
  }
  return urgentTaskService.getUserUrgentTask(userId);
};

export const createOrUpdateUrgentTask = async (userId: string, title: string): Promise<urgentTaskService.UrgentTask | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock creating/updating urgent task', title);
    return Promise.resolve({ ...MOCK_URGENT_TASK, title });
  }
  return urgentTaskService.createOrUpdateUrgentTask(userId, title);
};

export const deleteUrgentTask = async (userId: string): Promise<boolean> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock deleting urgent task');
    return Promise.resolve(true);
  }
  return urgentTaskService.deleteUrgentTask(userId);
};

// User Service Wrappers
export const getUserProfile = async (userId: string): Promise<userService.UserProfile | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Returning mock user profile');
    return Promise.resolve(MOCK_USER_PROFILE);
  }
  return userService.getUserProfile(userId);
};

export const createUserProfile = async (userId: string, displayName: string): Promise<userService.UserProfile | null> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock creating user profile', displayName);
    return Promise.resolve({ ...MOCK_USER_PROFILE, display_name: displayName });
  }
  return userService.createUserProfile(userId, displayName);
};

export const updateUserDisplayName = async (userId: string, displayName: string): Promise<boolean> => {
  if (isDevelopmentMode()) {
    console.log('🚧 Dev Mode: Mock updating user display name', displayName);
    return Promise.resolve(true);
  }
  return userService.updateUserDisplayName(userId, displayName);
};

// Re-export types
export type { CreateTaskData, Task, UpdateTaskData } from './taskService';
export type { UrgentTask } from './urgentTaskService';
export type { UserProfile } from './userService';

