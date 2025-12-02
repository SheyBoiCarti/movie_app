import { FetchMovies } from "@/api";
import { images } from "@/constants/images";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./app/components/SearchBar";
import MovieCard from "./app/MovieCard";
import useFetch from "./app/services/usefetch";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: movies, loading, error, refetch, reset } = useFetch(() => FetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await refetch();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full h-full z-0" resizeMode="cover" />

      <View className="px-5 my-5">
        <SearchBar
          placeholder="Search for a movie"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
      ) : error ? (
        <Text className="text-red-500 px-5">Error: {error.message}</Text>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingHorizontal: 15,
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            !loading && searchQuery.trim() ? (
              <Text className="text-center text-gray-500 mt-5">No movies found</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

export default Search