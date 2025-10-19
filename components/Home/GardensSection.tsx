import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { StaggeredContent } from "@/components/UI/StaggeredContent";
import GardenCard from "@/components/Gardens/GardenCard";
import { GardenDashboard } from "@/types/garden";
import { BodyText } from "@/components/UI/Text";

interface GardensSectionProps {
	gardens: GardenDashboard[] | undefined;
	isLoading?: boolean;
	onNavigate?: (route: string) => void;
}

export function GardensSection({
	gardens,
	isLoading = false,
	onNavigate,
}: GardensSectionProps) {
	// Safe navigation function that handles potential navigation errors
	const safeNavigate = (route: string) => {
		if (onNavigate) {
			try {
				onNavigate(route);
			} catch (error) {
				console.log("Navigation error:", error);
			}
		}
	};

	return (
		<View className="mb-6">
			<StaggeredContent index={4} baseDelay={560} staggerInterval={80}>
				<SectionHeader
					title="Your Gardens"
					icon="leaf"
					onSeeAll={
						onNavigate ? () => safeNavigate("/(tabs)/gardens") : undefined
					}
				/>
			</StaggeredContent>

			<StaggeredContent index={5} baseDelay={640} staggerInterval={80}>
				{isLoading ? (
					<View className="flex-row flex-wrap gap-4">
						<View className="flex-1 min-w-[45%] mb-4 h-[90px] bg-gray-100 rounded-xl " />
						<View className="flex-1 min-w-[45%] mb-4 h-[90px] bg-gray-100 rounded-xl " />
					</View>
				) : (
					<View className="flex-row flex-wrap gap-4">
						{gardens && gardens.length > 0 ? (
							<>
								{gardens.slice(0, 2).map((garden) => (
									<View
										key={garden.garden_id}
										className="flex-1 min-w-[45%] mb-4"
									>
										<GardenCard garden={garden} maxWidth={90} />
									</View>
								))}

								{/* New Garden Card */}
								<View className="flex-1 min-w-[45%] mb-4 h-[90px]">
									<TouchableOpacity
										className="flex-1 h-full border border-dashed border-primary rounded-xl p-4 items-center justify-center shadow-sm bg-transparent"
										onPress={() => safeNavigate("/(tabs)/gardens/new")}
									>
										<View className="items-center bg-transparent">
											<View className="w-10 h-8 items-center justify-center mb-2 bg-transparent">
												<Ionicons name="add" size={24} color="#5E994B" />
											</View>
											<BodyText className="text-primary font-medium bg-transparent">
												New Garden
											</BodyText>
										</View>
									</TouchableOpacity>
								</View>
							</>
						) : (
							<TouchableOpacity
								className="w-full border border-dashed border-cream-300 rounded-xl p-6 items-center shadow-sm bg-transparent"
								onPress={() => safeNavigate("/(tabs)/gardens/new")}
							>
								<View className="items-center bg-transparent">
									<View className="w-12 h-12 items-center justify-center mb-3 bg-transparent">
										<Ionicons name="add" size={28} color="#5E994B" />
									</View>
									<BodyText className="text-brand-600 font-medium mb-1 bg-transparent">
										Create Your First Garden
									</BodyText>
									<BodyText className="text-sm text-cream-700 text-center bg-transparent">
										Start your plant journey today
									</BodyText>
								</View>
							</TouchableOpacity>
						)}
					</View>
				)}
			</StaggeredContent>
		</View>
	);
}
