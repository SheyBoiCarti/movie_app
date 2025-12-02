import { fetchEpisodeDetails } from "@/api";
import { icons } from "@/constants/icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../../app/services/usefetch";

const EpisodeDetails = () => {
  const { tvId, seasonNumber, episodeNumber } = useLocalSearchParams();
  const router = useRouter();

  const {
    data: episode,
    loading,
    error,
  } = useFetch(
    () => {
      if (!tvId || !seasonNumber || !episodeNumber) return Promise.resolve(null);
      return fetchEpisodeDetails(tvId as string, Number(seasonNumber), Number(episodeNumber));
    },
    true
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <Text className="text-red-500">Error: {error.message}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-dark-100 px-4 py-2 rounded-full">
            <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="w-full h-[300px] relative">
          <Image
            source={{
              uri: episode?.still_path
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-5 left-5 bg-dark-100 p-2 rounded-full"
          >
            <Image source={icons.arrow} className="size-6" tintColor="white" />
          </TouchableOpacity>

          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
        </View>

        <View className="px-5 -mt-10">
          <Text className="text-2xl font-bold text-white">
            {episode?.episode_number}. {episode?.name}
          </Text>
          
          <View className="flex-row items-center gap-x-3 mt-2">
             <Text className="text-light-300 text-sm">
                {episode?.air_date}
            </Text>
            <View className="flex-row items-center gap-x-1">
              <Image source={icons.star} className="size-4" />
              <Text className="text-white font-bold text-sm">
                {Math.round((episode?.vote_average ?? 0) / 2)}
              </Text>
            </View>
            <Text className="text-light-300 text-sm">
                {episode?.runtime} min
            </Text>
          </View>

          <Text className="text-white text-lg font-bold mt-5 mb-2">
            Overview
          </Text>
          <Text className="text-light-300 leading-6">
            {episode?.overview || "No overview available."}
          </Text>

          {/* Guest Stars */}
          {episode?.guest_stars && episode.guest_stars.length > 0 && (
            <View className="mt-6">
                <Text className="text-white text-lg font-bold mb-3">Guest Stars</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {episode.guest_stars.map((star) => (
                        <View key={star.credit_id} className="mr-4 items-center w-20">
                            <Image 
                                source={{ uri: star.profile_path ? `https://image.tmdb.org/t/p/w185${star.profile_path}` : "https://placehold.co/100x150/1a1a1a/FFFFFF.png" }}
                                className="w-16 h-16 rounded-full mb-1"
                                resizeMode="cover"
                            />
                            <Text className="text-white text-xs text-center" numberOfLines={2}>{star.name}</Text>
                            <Text className="text-light-300 text-[10px] text-center" numberOfLines={1}>{star.character}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EpisodeDetails;
