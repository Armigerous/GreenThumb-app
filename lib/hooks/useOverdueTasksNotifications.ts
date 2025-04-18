import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";

export interface OverdueTask {
  task_id: number;
  task_type: string;
  plant_nickname: string;
  due_date: string;
}

export interface GardenNotification {
  garden_id: number;
  garden_name: string;
  health_impact: number;
  overdue_tasks_count: number;
  tasks: OverdueTask[];
}

export function useOverdueTasksNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<GardenNotification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Use a ref to track if we've already checked this session
  const hasCheckedRef = useRef(false);

  // Function to fetch garden health impact
  const fetchGardenHealthImpact = async () => {
    try {
      if (!user) return false;
      
      console.log("Fetching garden health impact...");
      
      // Using the function that accepts a user_id parameter
      const { data, error } = await supabase.rpc(
        'get_garden_health_impact', 
        { p_user_id: user.id }
      );
      
      if (error) {
        console.error("Error fetching garden health impact:", error);
        return false;
      }
      
      console.log("Garden health impact data:", data);
      
      if (data && data.length > 0) {
        // Process tasks if they are returned as a string
        const processedData = data.map((garden: any) => ({
          ...garden,
          tasks: typeof garden.tasks === 'string'
            ? JSON.parse(garden.tasks)
            : garden.tasks || []
        }));
        
        setNotifications(processedData);
        setShowModal(true);
        return true;
      }
      
      // If no data, clear notifications
      setNotifications([]);
      return false;
    } catch (err) {
      console.error("Error fetching garden health impact:", err);
      return false;
    }
  };

  useEffect(() => {
    async function checkOverdueNotifications() {
      try {
        // Avoid checking multiple times in the same session
        if (hasCheckedRef.current) {
          return;
        }
        
        // Only proceed if the user is loaded
        if (!isUserLoaded || !user) {
          return;
        }
        
        setLoading(true);
        hasCheckedRef.current = true;
        
        // Fetch garden health impact data
        await fetchGardenHealthImpact();
      } catch (err) {
        console.error('Unexpected error checking for overdue tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    // Check for notifications when the component mounts and user is loaded
    if (isUserLoaded && user) {
      checkOverdueNotifications();
    }
  }, [isUserLoaded, user]);

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
      hasCheckedRef.current = false; // Reset the check flag
      fetchGardenHealthImpact(); // Fetch garden health impact
    }
  };
} 