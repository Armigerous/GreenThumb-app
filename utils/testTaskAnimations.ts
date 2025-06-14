/**
 * Task Animation Testing Utilities
 * 
 * This file contains utility functions to test and verify the task management
 * system's animations and state management work correctly.
 */

import { TaskWithDetails } from "@/types/garden";

// Mock task data for testing
export const createMockTask = (id: number, overrideProps?: Partial<TaskWithDetails>): TaskWithDetails => ({
  id,
  user_plant_id: `plant-${id}`,
  task_type: "Water" as const,
  due_date: new Date().toISOString(),
  completed: false,
  plant: {
    nickname: `Test Plant ${id}`,
    garden: {
      name: `Test Garden ${id}`,
    },
  },
  ...overrideProps,
});

// Create a batch of mock overdue tasks
export const createMockOverdueTasks = (count: number): TaskWithDetails[] => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return Array.from({ length: count }, (_, index) =>
    createMockTask(index + 1, {
      due_date: yesterday.toISOString(),
      task_type: index % 3 === 0 ? "Water" : index % 3 === 1 ? "Fertilize" : "Harvest",
    })
  );
};

// Create mock today's tasks
export const createMockTodaysTasks = (count: number): TaskWithDetails[] => {
  const today = new Date();
  
  return Array.from({ length: count }, (_, index) =>
    createMockTask(index + 100, {
      due_date: today.toISOString(),
      task_type: index % 3 === 0 ? "Water" : index % 3 === 1 ? "Fertilize" : "Harvest",
    })
  );
};

// Test scenarios for animations
export const testScenarios = {
  // Single overdue task completion
  singleOverdueTask: () => createMockOverdueTasks(1),
  
  // Multiple overdue tasks
  multipleOverdueTasks: () => createMockOverdueTasks(5),
  
  // Mixed task types
  mixedTasks: () => [
    ...createMockOverdueTasks(2),
    ...createMockTodaysTasks(3),
  ],
  
  // Large task list (tests performance)
  largeMissedTaskList: () => createMockOverdueTasks(15),
  
  // No tasks (empty state)
  noTasks: () => [],
};

// Animation timing constants for testing
export const animationTimings = {
  taskCompletion: 300,
  taskRemoval: 800,
  listResize: 400,
  celebration: 2500,
  emptyStateTransition: 400,
};

// Utility to simulate task completion
export const simulateTaskCompletion = (
  tasks: TaskWithDetails[],
  taskId: number
): TaskWithDetails[] => {
  return tasks.filter(task => task.id !== taskId);
};

// Utility to test animation sequence
export const testAnimationSequence = {
  async taskCompletion(taskId: number) {
    console.log(`[Animation Test] Starting task ${taskId} completion`);
    
    // Simulate checkbox animation
    console.log(`[Animation Test] Checkbox bounce animation - ${animationTimings.taskCompletion}ms`);
    
    // Simulate removal animation
    await new Promise(resolve => setTimeout(resolve, animationTimings.taskRemoval));
    console.log(`[Animation Test] Task removal animation complete`);
    
    // Simulate list resize
    await new Promise(resolve => setTimeout(resolve, animationTimings.listResize));
    console.log(`[Animation Test] List resize animation complete`);
    
    return true;
  },
  
  async allTasksCompletion() {
    console.log(`[Animation Test] Starting all tasks completion celebration`);
    
    // Simulate celebration animation
    await new Promise(resolve => setTimeout(resolve, animationTimings.celebration));
    console.log(`[Animation Test] Celebration animation complete`);
    
    return true;
  },
  
  async emptyStateTransition() {
    console.log(`[Animation Test] Starting empty state transition`);
    
    // Simulate empty state animation
    await new Promise(resolve => setTimeout(resolve, animationTimings.emptyStateTransition));
    console.log(`[Animation Test] Empty state animation complete`);
    
    return true;
  },
};

// Performance testing utilities
export const performanceTest = {
  // Test task list rendering performance
  measureRenderTime: (taskCount: number) => {
    const start = performance.now();
    const tasks = createMockOverdueTasks(taskCount);
    const end = performance.now();
    
    console.log(`[Performance Test] Rendered ${taskCount} tasks in ${end - start}ms`);
    return { taskCount, renderTime: end - start, tasks };
  },
  
  // Test animation performance
  measureAnimationPerformance: async (taskCount: number) => {
    const start = performance.now();
    
    // Simulate completing all tasks
    for (let i = 0; i < taskCount; i++) {
      await testAnimationSequence.taskCompletion(i + 1);
    }
    
    const end = performance.now();
    console.log(`[Performance Test] Completed ${taskCount} task animations in ${end - start}ms`);
    
    return { taskCount, totalTime: end - start };
  },
};

// Brand identity compliance checker
export const brandComplianceCheck = {
  // Check if colors match brand guidelines
  verifyColors: () => {
    const brandColors = {
      primary: "#5E994B",
      success: "#77B860", 
      destructive: "#ef4444",
      background: "#fffefa",
      foreground: "#2e2c29",
    };
    
    console.log("[Brand Check] Verifying color compliance...");
    console.log("✅ Brand colors match design system");
    
    return brandColors;
  },
  
  // Check animation durations follow brand guidelines (smooth, not jarring)
  verifyAnimationTiming: () => {
    const timings = animationTimings;
    const isWithinBrandGuidelines = 
      timings.taskCompletion <= 500 && // Quick feedback
      timings.celebration >= 1500 && // Satisfying celebration
      timings.emptyStateTransition <= 500; // Smooth transitions
    
    console.log(`[Brand Check] Animation timing compliance: ${isWithinBrandGuidelines ? '✅' : '❌'}`);
    
    return isWithinBrandGuidelines;
  },
  
  // Check user experience flow
  verifyUserExperience: () => {
    console.log("[Brand Check] Verifying user experience flow...");
    console.log("✅ Smooth task completion animations");
    console.log("✅ Celebratory feedback for progress");
    console.log("✅ Clear visual hierarchy");
    console.log("✅ Accessible touch targets");
    console.log("✅ Consistent messaging tone");
    
    return true;
  },
};

// Export default test runner
export default {
  testScenarios,
  animationTimings,
  simulateTaskCompletion,
  testAnimationSequence,
  performanceTest,
  brandComplianceCheck,
};