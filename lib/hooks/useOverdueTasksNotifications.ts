import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useAtom } from "jotai";
import { hasShownOverdueModalAtom, overdueNotificationsAtom } from "@/atoms/session";

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
  const [showModal, setShowModal] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const [hasShownModal, setHasShownModal] = useAtom(hasShownOverdueModalAtom);
  const [notifications, setNotifications] = useAtom(overdueNotificationsAtom);

  // Fetch overdue tasks data (no showModal argument)
  const fetchOverdueTasksData = async () => {
    try {
      if (!user) return false;
      const { data, error } = await supabase.rpc(
        'get_overdue_task_notifications',
        { p_user_id: user.id }
      );
      if (error) {
        console.error("Error fetching overdue tasks data:", error);
        setNotifications([]);
        return false;
      }
      if (data && data.length > 0) {
        const processedData = data.map((garden: any) => ({
          garden_id: garden.garden_id,
          garden_name: garden.garden_name,
          overdue_tasks_count: garden.overdue_tasks_count,
          tasks: typeof garden.overdue_tasks === 'string'
            ? JSON.parse(garden.overdue_tasks)
            : garden.overdue_tasks || []
        }));
        setNotifications(processedData);
        return true;
      }
      setNotifications([]);
      return false;
    } catch (err) {
      console.error("Error fetching overdue tasks data:", err);
      setNotifications([]);
      return false;
    }
  };

  // On initial mount, fetch overdue notifications
  useEffect(() => {
    if (isUserLoaded && user && !hasShownModal) {
      setLoading(true);
      fetchOverdueTasksData().finally(() => setLoading(false));
    }
  }, [isUserLoaded, user, hasShownModal]);

  // Show modal only once per app open, and only if there are overdue tasks
  useEffect(() => {
    if (
      !hasShownModal &&
      notifications.some((n) => n.overdue_tasks_count > 0)
    ) {
      setShowModal(true);
      setHasShownModal(true);
    }
  }, [notifications, hasShownModal, setHasShownModal]);

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
      // Manual refresh does not show modal
      return fetchOverdueTasksData();
    },
    refreshOverdueData: () => {
      return fetchOverdueTasksData();
    }
  };
} 