import { FetchTV } from "@/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import SearchBar from "../components/SearchBar";
import MovieCard from "../MovieCard";
import useFetch from "../services/usefetch";

export default function TvShows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [tvList, setTvList] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading: tvLoading, error: tvError, refetch } = useFetch(
    () => FetchTV({ query: searchQuery, page, sortBy, year }),
    true
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Reset when filters or query change
      setPage(1);
      setHasMore(true);
      setTvList([]);
      await refetch();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, year]);

  useEffect(() => {
    if (!data) return;
    setHasMore(data.page < data.total_pages);
    setTvList((prev) => (data.page === 1 ? data.results : [...prev, ...data.results]));
  }, [data]);

  const loadMore = useCallback(async () => {
    if (tvLoading || !hasMore) return;
    setPage((p) => p + 1);
    await refetch();
  }, [tvLoading, hasMore, refetch]);

  
  const ListHeader = () => null;

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className='absolute w-full z-0'/> 
      <Image source={icons.logo} className="w-20 h-10 mt-20 mb-3 mx-auto"/>
      <View className="px-5">
        <SearchBar
          placeholder='Search for a TV show'
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        {/* Simple filter controls */}
        <View className="flex-row mt-3 gap-x-3">
          <Text onPress={() => setSortBy("popularity.desc")} className={`px-3 py-1 rounded-full ${sortBy === "popularity.desc" ? "bg-dark-200" : "bg-dark-100"} text-white`}>Popular</Text>
          <Text onPress={() => setSortBy("vote_average.desc")} className={`px-3 py-1 rounded-full ${sortBy === "vote_average.desc" ? "bg-dark-200" : "bg-dark-100"} text-white`}>Top Rated</Text>
          <Text onPress={() => setSortBy("first_air_date.desc")} className={`px-3 py-1 rounded-full ${sortBy === "first_air_date.desc" ? "bg-dark-200" : "bg-dark-100"} text-white`}>Latest</Text>
          <Text onPress={() => setYear(new Date().getFullYear())} className={`px-3 py-1 rounded-full ${year ? "bg-dark-200" : "bg-dark-100"} text-white`}>This Year</Text>
          <Text onPress={() => setYear(undefined)} className={`px-3 py-1 rounded-full ${!year ? "bg-dark-200" : "bg-dark-100"} text-white`}>All Years</Text>
        </View>
        <Text className="text-lg text-white mt-5 mb-3">Latest TV Shows</Text>
      </View>

      {tvLoading ? (
        <ActivityIndicator 
          size="large"
          color="#0000ff"
          className="mt-10 self-center"
        />
      ) : tvError ? (
        <Text className="p-5 text-red-500">Error: {tvError?.message}</Text>
      ) : (
        <FlatList
          data={tvList}
          renderItem={({ item }) => (
            <MovieCard {...item} type="tv" />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          ListHeaderComponent={ListHeader}
          keyboardShouldPersistTaps="always"
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingHorizontal: 15,
          }}
          
          contentContainerStyle={{ paddingBottom: 120 }}
          className="mt-2"
        />
      )}
    </View>
  );
}