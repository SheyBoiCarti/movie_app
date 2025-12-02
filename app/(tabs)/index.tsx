import { fetchGenres, FetchMovies, FilterOptions } from "@/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from "../components/SearchBar";
import MovieCard from "../MovieCard";
import useFetch from "../services/usefetch";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchGenres('movie').then(setGenres);
  }, []);

  const { data, loading: moviesLoading, error: moviesError, refetch } = useFetch(
    () => FetchMovies({ query: searchQuery, page, sortBy, year, filters }),
    true
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Reset when filters or query change
      setPage(1);
      setHasMore(true);
      setMoviesList([]);
      await refetch();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, year, filters]);

  useEffect(() => {
    if (!data) return;
    setHasMore(data.page < data.total_pages);
    setMoviesList((prev) => (data.page === 1 ? data.results : [...prev, ...data.results]));
  }, [data]);

  const loadMore = useCallback(async () => {
    if (moviesLoading || !hasMore) return;
    setPage((p) => p + 1);
    await refetch();
  }, [moviesLoading, hasMore, refetch]);

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

  const ListHeader = (
    <View className="px-5 mb-6">
      <View className="items-center mt-4 mb-8">
        <Image 
          source={icons.logo} 
          className="w-48 h-16" 
          resizeMode="contain"
        />
      </View>

      <View className="flex-row items-center gap-3 mb-8">
        <View className="flex-1 shadow-lg shadow-black/20">
          <SearchBar
            placeholder='Search for a movie...'
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(true)} 
          className="bg-accent p-3.5 rounded-full shadow-md shadow-accent/20"
        >
           <Ionicons name="options" size={24} color="#030014" />
        </TouchableOpacity>
      </View>

      {/* Simple filter controls */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        <TouchableOpacity onPress={() => setSortBy("popularity.desc")} className={`px-5 py-2.5 rounded-full border ${sortBy === "popularity.desc" ? "bg-accent border-accent" : "bg-transparent border-light-300/30"}`}>
          <Text className={`${sortBy === "popularity.desc" ? "text-primary font-bold" : "text-light-200"}`}>Popular</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setSortBy("vote_average.desc")} className={`px-5 py-2.5 rounded-full border ${sortBy === "vote_average.desc" ? "bg-accent border-accent" : "bg-transparent border-light-300/30"}`}>
          <Text className={`${sortBy === "vote_average.desc" ? "text-primary font-bold" : "text-light-200"}`}>Top Rated</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setSortBy("release_date.desc")} className={`px-5 py-2.5 rounded-full border ${sortBy === "release_date.desc" ? "bg-accent border-accent" : "bg-transparent border-light-300/30"}`}>
          <Text className={`${sortBy === "release_date.desc" ? "text-primary font-bold" : "text-light-200"}`}>Latest</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setYear(new Date().getFullYear())} className={`px-5 py-2.5 rounded-full border ${year ? "bg-accent border-accent" : "bg-transparent border-light-300/30"}`}>
          <Text className={`${year ? "text-primary font-bold" : "text-light-200"}`}>This Year</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setYear(undefined)} className={`px-5 py-2.5 rounded-full border ${!year ? "bg-accent border-accent" : "bg-transparent border-light-300/30"}`}>
          <Text className={`${!year ? "text-primary font-bold" : "text-light-200"}`}>All Years</Text>
        </TouchableOpacity>
      </ScrollView>
      <Text className="text-xl font-bold text-white mt-8 tracking-wide">Latest Movies</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className='absolute w-full h-full z-0 opacity-60' resizeMode="cover"/> 
      
      <SafeAreaView className="flex-1">
        <FlatList
          data={moviesList}
          renderItem={({ item }) => (
            <MovieCard {...item} type="movie" />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            !moviesLoading && moviesError ? (
              <Text className="p-5 text-red-500 text-center">Error: {moviesError?.message}</Text>
            ) : !moviesLoading && moviesList.length === 0 ? (
               <Text className="p-5 text-white text-center">No movies found.</Text>
            ) : null
          }
          ListFooterComponent={
            moviesLoading ? (
              <ActivityIndicator 
                size="large"
                color="#AB8BFF"
                className="my-10"
              />
            ) : <View className="h-20" />
          }
          keyboardShouldPersistTaps="always"
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}
          
          contentContainerStyle={{ paddingBottom: 40 }}
          className="flex-1"
        />
      </SafeAreaView>

      <Modal 
        visible={showFilters} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-primary/95 mt-20 rounded-t-3xl p-5 border-t border-light-300/10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text className="text-accent text-lg font-bold">Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-white font-bold mb-3 text-lg">Genres</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {genres.map(g => (
                <TouchableOpacity 
                  key={g.id} 
                  onPress={() => toggleGenre(g.id)}
                  className={`px-4 py-2 rounded-full border ${filters.with_genres?.split(',').includes(String(g.id)) ? 'bg-accent border-accent' : 'bg-dark-200 border-gray-700'}`}
                >
                  <Text className={filters.with_genres?.split(',').includes(String(g.id)) ? 'text-primary font-bold' : 'text-light-200'}>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white font-bold mb-3 text-lg">Minimum Rating: {filters.vote_average_gte ?? 0}</Text>
            <View className="flex-row gap-3 mb-6">
              {[0, 5, 7, 8, 9].map(rating => (
                <TouchableOpacity 
                  key={rating} 
                  onPress={() => setFilters({...filters, vote_average_gte: rating})}
                  className={`w-10 h-10 rounded-full items-center justify-center ${filters.vote_average_gte === rating ? 'bg-accent' : 'bg-dark-200 border border-gray-700'}`}
                >
                  <Text className={filters.vote_average_gte === rating ? 'text-primary font-bold' : 'text-white'}>{rating}+</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between items-center mb-6 bg-dark-200 p-4 rounded-xl">
              <Text className="text-white font-bold text-lg">Include Adult Content</Text>
              <Switch 
                value={filters.include_adult ?? false} 
                onValueChange={(val) => setFilters({...filters, include_adult: val})}
                trackColor={{ false: "#767577", true: "#AB8BFF" }}
                thumbColor={filters.include_adult ? "#fff" : "#f4f3f4"}
              />
            </View>

            <Text className="text-white font-bold mb-3 text-lg">Language (ISO code)</Text>
            <TextInput 
              className="bg-dark-200 text-white p-4 rounded-xl mb-8 border border-gray-700"
              placeholder="e.g. en, es, fr"
              placeholderTextColor="#666"
              value={filters.language}
              onChangeText={(text) => setFilters({...filters, language: text})}
            />
            
            <TouchableOpacity 
              onPress={() => setFilters({})}
              className="bg-red-500/10 border border-red-500 p-4 rounded-xl items-center mb-10"
            >
              <Text className="text-red-500 font-bold text-lg">Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}