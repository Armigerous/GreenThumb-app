import { TaskList } from "@/components/TaskList";
import AnimatedTransition from "@/components/UI/AnimatedTransition";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, SubtitleText, BodyText, Text } from "@/components/UI/Text";
import { useTasksForDate, getTasksForDate } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { TaskWithDetails } from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addDays,
	addWeeks,
	format,
	getMonth,
	getYear,
	isSameDay,
	setMonth,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { TASK_TYPE_META } from "@/constants/taskTypes";
import CareTaskLegendModal from "@/components/UI/CareTaskLegendModal";

export default function CalendarScreen() {
	const { user } = useUser();
	const [selectedDay, setSelectedDay] = useState<Date>(new Date());
	const [weekStartDate, setWeekStartDate] = useState<Date>(
		startOfWeek(new Date(), { weekStartsOn: 0 })
	);

	// Generate days for the week view - moved up to avoid reference before declaration
	const weekDays = useMemo(() => {
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			days.push(addDays(weekStartDate, i));
		}
		return days;
	}, [weekStartDate]);

	const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
	const queryClient = useQueryClient();
	const tasksOpacity = useSharedValue(1);
	const weekShift = useSharedValue(0);

	// Use the hook to fetch tasks for the selected date
	const {
		data: tasks,
		isLoading,
		isError,
		refetch,
	} = useTasksForDate(selectedDay, user?.id);

	// Add a state to track day change loading separately
	const [isDayChanging, setIsDayChanging] = useState(false);

	// Add state for legend modal
	const [isLegendVisible, setIsLegendVisible] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	// Helper function to prefetch tasks for a specific date
	const prefetchTasksForDate = useCallback(
		(date: Date) => {
			if (!user?.id) return;

			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			const formattedDate = `${year}-${month}-${day}`;

			// Only prefetch if not already in cache or if data is not fresh
			const existingQuery = queryClient.getQueryState([
				"tasks",
				formattedDate,
				user.id,
			]);

			if (
				!existingQuery ||
				existingQuery.status === "error" ||
				existingQuery.fetchStatus === "idle"
			) {
				queryClient.prefetchQuery({
					queryKey: ["tasks", formattedDate, user.id],
					queryFn: () => getTasksForDate(date, user.id),
					staleTime: 1000 * 60 * 30, // Match the staleTime from useTasksForDate
				});
			}
		},
		[queryClient, user?.id]
	);

	// Helper function to prefetch tasks for a full week
	const prefetchWeekTasks = useCallback(
		(startDate: Date) => {
			if (!user?.id) return;

			// Prefetch entire week at once
			for (let i = 0; i < 7; i++) {
				const day = addDays(startDate, i);
				prefetchTasksForDate(day);
			}

			// Also prefetch the same day in adjacent weeks for smoother navigation
			const nextWeekDay = addWeeks(startDate, 1);
			const prevWeekDay = subWeeks(startDate, 1);

			prefetchTasksForDate(nextWeekDay);
			prefetchTasksForDate(prevWeekDay);
		},
		[user?.id, prefetchTasksForDate]
	);

	// Prefetch initial data when component mounts
	useEffect(() => {
		if (user?.id) {
			// Prefetch current week
			prefetchWeekTasks(weekStartDate);

			// Prefetch next and previous weeks
			prefetchWeekTasks(addWeeks(weekStartDate, 1));
			prefetchWeekTasks(subWeeks(weekStartDate, 1));
		}
	}, [user?.id, prefetchWeekTasks, weekStartDate]);

	// Fade tasks while new data loads
	useEffect(() => {
		if (!isLoading && tasks) {
			setIsDayChanging(false);
			tasksOpacity.value = withTiming(1, {
				duration: 220,
				easing: Easing.out(Easing.cubic),
			});
		}
	}, [isLoading, tasks, tasksOpacity]);
	useEffect(() => {
		if (isDayChanging || isLoading) {
			tasksOpacity.value = withTiming(0.2, {
				duration: 140,
				easing: Easing.out(Easing.quad),
			});
		}
	}, [isDayChanging, isLoading, tasksOpacity]);

	// Handle day changes with a gentle fade
	const handleDayChange = (day: Date, _index: number) => {
		if (isSameDay(day, selectedDay)) return;

		tasksOpacity.value = withTiming(0.2, {
			duration: 140,
			easing: Easing.out(Easing.quad),
		});
		setIsDayChanging(true);

		setSelectedDay(day);

		const formattedDate = format(day, "yyyy-MM-dd");
		const existingQuery = queryClient.getQueryState([
			"tasks",
			formattedDate,
			user?.id,
		]);

		if (!existingQuery || existingQuery.status === "error") {
			queryClient.invalidateQueries({
				queryKey: ["tasks", formattedDate, user?.id],
			});
		}

		refetch();
	};

	// Track initial load state to avoid redundant transitions
	useEffect(() => {
		if (isFirstLoad) {
			// No animation setup - content shows immediately
			setIsFirstLoad(false);
		}
	}, [isFirstLoad, tasks]);

	// Refetch tasks when user changes
	useEffect(() => {
		if (user?.id) {
			// Invalidate task queries to ensure fresh data
			queryClient.invalidateQueries({
				queryKey: ["tasks"],
			});
			refetch();
		}
	}, [refetch, queryClient, user?.id]);

	// Toggle task completion mutation with optimistic updates
	const toggleTaskMutation = useMutation({
		mutationFn: async ({
			id,
			completed,
		}: {
			id: number;
			completed: boolean;
		}) => {
			const { error } = await supabase
				.from("plant_tasks")
				.update({ completed })
				.eq("id", id);

			if (error) throw error;
			return { id, completed };
		},
		onMutate: async ({ id, completed }) => {
			// Create formatted date string for consistent cache keys
			const formattedDate = format(selectedDay, "yyyy-MM-dd");
			const queryKey = ["tasks", formattedDate, user?.id];

			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKey,
			});

			// Snapshot the previous value
			const previousTasks = queryClient.getQueryData(queryKey);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, (old: TaskWithDetails[] | undefined) =>
				old?.map((task) => (task.id === id ? { ...task, completed } : task))
			);

			// Return a context object with the snapshotted value
			return { previousTasks, queryKey };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTasks && context.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousTasks);
			}
			console.error("Error updating task:", err);
		},
		onSuccess: (data, variables, context) => {
			// On success, don't invalidate - our optimistic update is already correct
			// Just update the UI to show task completed successfully

			// If this is the last task in the date, make sure to refresh to properly show "no tasks" UI
			if (context?.queryKey && tasks && tasks.length === 1) {
				// Only refetch if this was the last task
				queryClient.invalidateQueries({
					queryKey: context.queryKey,
				});
			}
		},
		onSettled: (data, error, variables, context) => {
			// Only do a background refetch after a delay to ensure data is consistent
			if (context?.queryKey) {
				setTimeout(() => {
					queryClient.invalidateQueries({
						queryKey: context.queryKey,
						refetchType: "all",
					});
				}, 1000);
			}
		},
	});

	// Function to handle marking a task as complete
	const handleToggleComplete = async (id: number, completed: boolean) => {
		const taskToUpdate = tasks?.find((task) => task.id === id);
		if (!taskToUpdate) return;

		// Execute the mutation with optimistic updates
		toggleTaskMutation.mutate({
			id,
			completed,
		});
	};

	// Animate week navigation with a subtle slide
	const animateWeekChange = useCallback(
		(direction: "left" | "right") => {
			const distance = direction === "left" ? -24 : 24;

			weekShift.value = withTiming(
				distance,
				{
					duration: 160,
					easing: Easing.out(Easing.cubic),
				},
				() => {
					weekShift.value = withTiming(0, {
						duration: 180,
						easing: Easing.out(Easing.cubic),
					});
				}
			);
		},
		[weekShift]
	);
	// Week navigation helpers
	const goToPreviousWeek = () => {
		tasksOpacity.value = withTiming(0.2, {
			duration: 140,
			easing: Easing.out(Easing.quad),
		});
		setIsDayChanging(true);
		animateWeekChange("right");

		const newWeekStartDate = subWeeks(weekStartDate, 1);
		const newSelectedDay = subWeeks(selectedDay, 1);

		setWeekStartDate(newWeekStartDate);
		setSelectedDay(newSelectedDay);

		prefetchWeekTasks(subWeeks(newWeekStartDate, 1));

		const formattedDate = format(newSelectedDay, "yyyy-MM-dd");
		const existingQuery = queryClient.getQueryState([
			"tasks",
			formattedDate,
			user?.id,
		]);

		if (!existingQuery || existingQuery.status === "error") {
			queryClient.invalidateQueries({
				queryKey: ["tasks", formattedDate, user?.id],
			});
		}

		refetch();
	};

	const goToNextWeek = () => {
		tasksOpacity.value = withTiming(0.2, {
			duration: 140,
			easing: Easing.out(Easing.quad),
		});
		setIsDayChanging(true);
		animateWeekChange("left");

		const newWeekStartDate = addWeeks(weekStartDate, 1);
		const newSelectedDay = addWeeks(selectedDay, 1);

		setWeekStartDate(newWeekStartDate);
		setSelectedDay(newSelectedDay);

		prefetchWeekTasks(addWeeks(newWeekStartDate, 1));

		const formattedDate = format(newSelectedDay, "yyyy-MM-dd");
		const existingQuery = queryClient.getQueryState([
			"tasks",
			formattedDate,
			user?.id,
		]);

		if (!existingQuery || existingQuery.status === "error") {
			queryClient.invalidateQueries({
				queryKey: ["tasks", formattedDate, user?.id],
			});
		}

		refetch();
	};

	const goToToday = () => {
		const today = new Date();
		const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 });

		if (isSameDay(today, selectedDay)) {
			return;
		}

		tasksOpacity.value = withTiming(0.2, {
			duration: 140,
			easing: Easing.out(Easing.quad),
		});
		setIsDayChanging(true);
		animateWeekChange("left");

		setSelectedDay(today);
		setWeekStartDate(todayWeekStart);

		prefetchWeekTasks(addWeeks(todayWeekStart, 1));
		prefetchWeekTasks(subWeeks(todayWeekStart, 1));

		const formattedDate = format(today, "yyyy-MM-dd");
		queryClient.invalidateQueries({
			queryKey: ["tasks", formattedDate, user?.id],
		});
		refetch();
	};

	// Month selection
	const months = useMemo(() => {
		const currentYear = getYear(selectedDay);
		return Array.from({ length: 12 }, (_, i) => ({
			label: format(new Date(currentYear, i), "MMMM yyyy"),
			value: i,
		}));
	}, [selectedDay]);

	const selectMonth = (monthIndex: number) => {
		tasksOpacity.value = withTiming(0.2, {
			duration: 140,
			easing: Easing.out(Easing.quad),
		});
		setIsDayChanging(true);

		const newDate = setMonth(selectedDay, monthIndex);
		const newWeekStart = startOfWeek(newDate, { weekStartsOn: 0 });

		setSelectedDay(newDate);
		setWeekStartDate(newWeekStart);
		setIsMonthPickerVisible(false);

		prefetchWeekTasks(newWeekStart);
		prefetchWeekTasks(addWeeks(newWeekStart, 1));
		prefetchWeekTasks(subWeeks(newWeekStart, 1));

		const formattedDate = format(newDate, "yyyy-MM-dd");
		const existingQuery = queryClient.getQueryState([
			"tasks",
			formattedDate,
			user?.id,
		]);

		if (!existingQuery || existingQuery.status === "error") {
			queryClient.invalidateQueries({
				queryKey: ["tasks", formattedDate, user?.id],
			});
		}

		refetch();
	};

	// Group tasks by garden
	const groupedTasks = useMemo(() => {
		if (!tasks || tasks.length === 0) return {};

		return tasks.reduce<Record<string, TaskWithDetails[]>>((acc, task) => {
			const gardenName = task.plant?.garden?.name || "Unknown Garden";
			if (!acc[gardenName]) {
				acc[gardenName] = [];
			}
			acc[gardenName].push(task);
			return acc;
		}, {});
	}, [tasks]);

	// Animated styles
	const weekAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: weekShift.value }],
	}));

	const tasksAnimatedStyle = useAnimatedStyle(() => ({
		opacity: tasksOpacity.value,
	}));

	return (
		<PageContainer scroll={false} padded={false} animate={false}>
			{/* Header */}
			<View className="px-5 pt-5">
				<View className="flex-row justify-between items-center mb-4">
					<View className="flex-row items-center">
						<TitleText className="text-3xl">Calendar of Care</TitleText>
					</View>
					<TouchableOpacity
						onPress={() => setIsMonthPickerVisible(true)}
						className="flex-row items-center bg-brand-50 px-3 py-1 rounded-lg border border-brand-100"
					>
						<BodyText className="text-brand-600 mr-1">
							{format(selectedDay, "MMMM yyyy")}
						</BodyText>
						<Ionicons name="chevron-down" size={16} color="#059669" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Week Navigation */}
			<View className="px-5 flex-row justify-between items-center mb-4">
				<TouchableOpacity onPress={goToPreviousWeek} className="p-2">
					<Ionicons name="chevron-back" size={24} color="#374151" />
				</TouchableOpacity>

				<View>
					<TouchableOpacity
						onPress={goToToday}
						className="flex-row items-center px-3 py-1 rounded-lg bg-brand-50 border border-brand-100"
					>
						<Ionicons
							name="calendar"
							size={16}
							color="#059669"
							className="mr-1"
						/>
						<BodyText className="text-brand-600">Today</BodyText>
					</TouchableOpacity>
				</View>

				<TouchableOpacity onPress={goToNextWeek} className="p-2">
					<Ionicons name="chevron-forward" size={24} color="#374151" />
				</TouchableOpacity>
			</View>

			{/* Week View */}
			<Animated.View className="px-5" style={weekAnimatedStyle}>
				<View className="flex-row justify-between mb-6">
					{weekDays.map((day, index) => (
						<View key={index}>
							<TouchableOpacity
								className={`items-center justify-center w-12 h-16 rounded-lg ${
									isSameDay(day, selectedDay)
										? "bg-brand-500 border border-brand-600"
										: isSameDay(day, new Date())
										? "bg-brand-100 border border-brand-200"
										: "bg-cream-50 border border-cream-300"
								}`}
								onPress={() => handleDayChange(day, index)}
							>
								<Text
									className={`text-xs ${
										isSameDay(day, selectedDay)
											? "text-white"
											: isSameDay(day, new Date())
											? "text-brand-600"
											: "text-cream-500"
									}`}
								>
									{format(day, "EEE")}
								</Text>
								<BodyText
									className={`text-lg ${
										isSameDay(day, selectedDay)
											? "text-white"
											: isSameDay(day, new Date())
											? "text-brand-600"
											: "text-foreground"
									}`}
								>
									{format(day, "d")}
								</BodyText>
							</TouchableOpacity>
						</View>
					))}
				</View>
			</Animated.View>

			{/* Tasks Section */}
			<View className="px-5 mb-4 flex-row items-center justify-between">
				<View className="flex-row items-center">
					<SubtitleText className="text-lg text-foreground">
						Care Tasks
					</SubtitleText>
					<TouchableOpacity
						onPress={() => setIsLegendVisible(true)}
						className="ml-2 p-1"
						accessibilityLabel="What are Care Tasks?"
						accessibilityRole="button"
					>
						<Ionicons
							name="information-circle-outline"
							size={20}
							color="#5E994B"
						/>
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView className="flex-1 px-5">
				{isLoading || isDayChanging ? (
					<View className="flex-1 items-center justify-center">
						<AnimatedTransition initialY={5} duration={300}>
							<LoadingSpinner message="Loading tasks..." />
						</AnimatedTransition>
					</View>
				) : isError ? (
					<View className="bg-red-50 rounded-xl p-8 items-center justify-center">
						<Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
						<BodyText className="text-red-500 mt-4 text-center">
							Error loading tasks. Please try again.
						</BodyText>
					</View>
				) : (
					<Animated.View className="flex-1" style={tasksAnimatedStyle}>
						<TaskList
							key={format(selectedDay, "yyyy-MM-dd")} // Force remount when day changes
							tasks={tasks || []}
							onToggleComplete={handleToggleComplete}
							removeOnComplete={false}
							showGardenName={false}
							groupByGarden={true}
						/>
					</Animated.View>
				)}
			</ScrollView>

			{/* Month Picker Modal */}
			<Modal
				visible={isMonthPickerVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setIsMonthPickerVisible(false)}
			>
				<TouchableOpacity
					className="flex-1 bg-black/50"
					activeOpacity={1}
					onPress={() => setIsMonthPickerVisible(false)}
				>
					<View className="flex-1 justify-center px-5">
						<View className="bg-cream-50 border border-cream-300 rounded-xl p-4">
							<SubtitleText className="text-lg text-foreground border-b border-cream-300 pb-4">
								Select Month
							</SubtitleText>
							<ScrollView className="max-h-80">
								{months.map((month, index) => (
									<TouchableOpacity
										key={index}
										className={`py-3 px-4 rounded-lg ${
											getMonth(selectedDay) === month.value
												? "bg-brand-50"
												: "bg-transparent"
										}`}
										onPress={() => selectMonth(month.value)}
									>
										<BodyText
											className={`${
												getMonth(selectedDay) === month.value
													? "text-brand-600"
													: "text-foreground"
											}`}
										>
											{month.label}
										</BodyText>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</View>
				</TouchableOpacity>
			</Modal>

			{/* Task Info Modal (Care Tasks + Legend) */}
			{/*
        Reason: The Care Task Legend modal is now extracted to its own component for maintainability and to fix accidental dismiss issues. It is imported as CareTaskLegendModal below.
      */}
			<CareTaskLegendModal
				visible={isLegendVisible}
				onClose={() => setIsLegendVisible(false)}
			/>
		</PageContainer>
	);
}
