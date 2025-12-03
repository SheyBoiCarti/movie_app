import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { FavoriteItem, getFavorites } from "@/lib/favorites";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteCard = ({ item }: { item: FavoriteItem }) => {
  return (
    <Link href={`/movies/${item.itemId}?type=${item.type}`} asChild>
      <TouchableOpacity className="flex-row items-center bg-dark-100 p-3 rounded-xl mb-3">
        <Image
          source={{
            uri: item.posterPath
              ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-16 h-24 rounded-lg mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-light-300 text-sm mt-1 uppercase">
            {item.type === "movie" ? "Movie" : "TV Show"}
          </Text>
        </View>
        <Image
          source={icons.arrow}
          className="size-5 rotate-180"
          tintColor="#A8B5DB"
        />
      </TouchableOpacity>
    </Link>
  );
};

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const type = filter === "all" ? undefined : filter;
      const data = await getFavorites(type);
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  // Reload favorites when the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [filter])
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-center mb-6">
          <Image source={icons.logo} className="w-48 h-16" resizeMode="contain" />
        </View>

        <Text className="text-white text-2xl font-bold mb-4">My Favorites</Text>

        {/* Filter Tabs */}
        <View className="flex-row gap-3 mb-4">
          {(["all", "movie", "tv"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              className={`px-4 py-2 rounded-full border ${
                filter === type
                  ? "bg-accent border-accent"
                  : "bg-transparent border-light-300/30"
              }`}
            >
              <Text
                className={`font-semibold ${
                  filter === type ? "text-primary" : "text-light-300"
                }`}
              >
                {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#AB8BFF" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadFavorites}
            className="mt-4 px-6 py-3 bg-accent rounded-full"
          >
            <Text className="text-primary font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Image source={icons.save} className="size-16 mb-4" tintColor="#A8B5DB" />
          <Text className="text-light-300 text-lg text-center">
            No favorites yet
          </Text>
          <Text className="text-light-300/60 text-center mt-2">
            Save movies and TV shows to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.$id || `${item.itemId}-${item.type}`}
          renderItem={({ item }) => <FavoriteCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
