import { fetchGenres, FetchTV, FilterOptions } from "@/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchGenres('tv').then(setGenres);
  }, []);

  const { data, loading: tvLoading, error: tvError, refetch } = useFetch(
    () => FetchTV({ query: searchQuery, page, sortBy, year, filters }),
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
  }, [searchQuery, sortBy, year, filters]);

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

  const toggleGenre = (genreId: number) => {
    const currentGenres = filters.with_genres ? filters.with_genres.split(',') : [];
    const idStr = String(genreId);
    let newGenres;
    if (currentGenres.includes(idStr)) {
      newGenres = currentGenres.filter(id => id !== idStr);
    } else {
      newGenres = [...currentGenres, idStr];
    }
    setFilters({ ...filters, with_genres: newGenres.join(',') });
  };

  const ListHeader = () => null;

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className='absolute w-full z-0'/> 
      <Image source={icons.logo} className="w-20 h-10 mt-20 mb-3 mx-auto"/>
      <View className="px-5">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              placeholder='Search for a TV show'
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>
          <TouchableOpacity onPress={() => setShowFilters(true)} className="bg-dark-100 p-3 rounded-full">
             <Image source={icons.search} className="size-5" tintColor="white" />
          </TouchableOpacity>
        </View>

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

      <Modal 
        visible={showFilters} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-primary/95 mt-20 rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-bold">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text className="text-accent text-lg font-bold">Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <Text className="text-white font-bold mb-2">Genres</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {genres.map(g => (
                <TouchableOpacity 
                  key={g.id} 
                  onPress={() => toggleGenre(g.id)}
                  className={`px-3 py-1 rounded-full border ${filters.with_genres?.split(',').includes(String(g.id)) ? 'bg-secondary border-secondary' : 'bg-dark-200 border-gray-700'}`}
                >
                  <Text className={filters.with_genres?.split(',').includes(String(g.id)) ? 'text-black' : 'text-white'}>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white font-bold mb-2">Minimum Rating: {filters.vote_average_gte ?? 0}</Text>
            <View className="flex-row gap-2 mb-5">
              {[0, 5, 7, 8, 9].map(rating => (
                <TouchableOpacity 
                  key={rating} 
                  onPress={() => setFilters({...filters, vote_average_gte: rating})}
                  className={`px-3 py-1 rounded-full ${filters.vote_average_gte === rating ? 'bg-secondary' : 'bg-dark-200'}`}
                >
                  <Text className={filters.vote_average_gte === rating ? 'text-black' : 'text-white'}>{rating}+</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white font-bold">Include Adult Content</Text>
              <Switch 
                value={filters.include_adult ?? false} 
                onValueChange={(val) => setFilters({...filters, include_adult: val})}
                trackColor={{ false: "#767577", true: "#FF9C01" }}
              />
            </View>

            <Text className="text-white font-bold mb-2">Language (ISO code, e.g. en, es, fr)</Text>
            <TextInput 
              className="bg-dark-200 text-white p-3 rounded-lg mb-5"
              placeholder="en"
              placeholderTextColor="#666"
              value={filters.language}
              onChangeText={(text) => setFilters({...filters, language: text})}
            />
            
            <TouchableOpacity 
              onPress={() => setFilters({})}
              className="bg-red-500 p-3 rounded-lg items-center mt-5"
            >
              <Text className="text-white font-bold">Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

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