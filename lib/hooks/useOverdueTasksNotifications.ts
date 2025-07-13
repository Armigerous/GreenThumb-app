import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useAtom } from "jotai";
import { hasShownOverdueModalAtom } from "@/atoms/session";

export interface OverdueTask {
  task_id: number;
  task_type: string | null;
  plant_nickname: string;
  due_date: string;
}

export interface GardenNotification {
  garden_id: number;
  garden_name: string;
  overdue_tasks_count: number;
  tasks: OverdueTask[];
}

export function useOverdueTasksNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<GardenNotification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const [hasShownModal, setHasShownModal] = useAtom(hasShownOverdueModalAtom);

  // Function to fetch overdue tasks data
  const fetchOverdueTasksData = async (showModal: boolean) => {
    try {
      if (!user) return false;
      
      console.log("Fetching overdue tasks data...");
      
      // Using the function that accepts a user_id parameter
      const { data, error } = await supabase.rpc(
        'get_overdue_task_notifications', 
        { p_user_id: user.id }
      );
      
      if (error) {
        console.error("Error fetching overdue tasks data:", error);
        return false;
      }
      
      console.log("Overdue tasks data:", data);
      
      if (data && data.length > 0) {
        // Process tasks if they are returned as a string
        const processedData = data.map((garden: any) => ({
          garden_id: garden.garden_id,
          garden_name: garden.garden_name,
          overdue_tasks_count: garden.overdue_tasks_count,
          tasks: typeof garden.overdue_tasks === 'string'
            ? JSON.parse(garden.overdue_tasks)
            : garden.overdue_tasks || []
        }));
        
        setNotifications(processedData);
        if (showModal && !hasShownModal) {
          setShowModal(true);
          setHasShownModal(true);
        }
        return true;
      }
      
      // If no data, clear notifications
      setNotifications([]);
      return false;
    } catch (err) {
      console.error("Error fetching overdue tasks data:", err);
      return false;
    }
  };

  useEffect(() => {
    async function checkOverdueNotifications() {
      try {
        // Only proceed if the user is loaded and modal hasn't been shown this session
        if (!isUserLoaded || !user || hasShownModal) {
          return;
        }
        
        setLoading(true);
        // Fetch overdue tasks data
        await fetchOverdueTasksData(true);
      } catch (err) {
        console.error('Unexpected error checking for overdue tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    // Check for notifications when the component mounts and user is loaded
    if (isUserLoaded && user && !hasShownModal) {
      checkOverdueNotifications();
    }
  }, [isUserLoaded, user, hasShownModal]);

  /**
   * Checks if a specific garden has any overdue tasks
   * @param gardenId - The ID of the garden to check
   * @returns Boolean indicating if the garden has overdue tasks
   */
  const hasGardenOverdueTasks = (gardenId: number): boolean => {
    const gardenNotification = notifications.find(
      (notification) => notification.garden_id === gardenId
    );
    return !!gardenNotification && gardenNotification.overdue_tasks_count > 0;
  };

  /**
   * Gets the count of overdue tasks for a specific garden
   * @param gardenId - The ID of the garden to check
   * @returns The number of overdue tasks or 0 if none
   */
  const getGardenOverdueTasksCount = (gardenId: number): number => {
    const gardenNotification = notifications.find(
      (notification) => notification.garden_id === gardenId
    );
    return gardenNotification?.overdue_tasks_count || 0;
  };

  return {
    loading,
    notifications,
    showModal,
    setShowModal,
    hasGardenOverdueTasks,
    getGardenOverdueTasksCount,
    checkNotifications: () => {
      // Resetting the modal for manual refresh is not allowed for session-global logic
      return fetchOverdueTasksData(false); // Don't show modal when manually refreshing
    },
    // Add a method to refresh data without showing modal
    refreshOverdueData: () => {
      return fetchOverdueTasksData(false);
    }
  };
} 