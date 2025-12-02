import { fetchGenres, FetchMovies, FilterOptions } from "@/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const ListHeader = () => null;

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className='absolute w-full z-0'/> 
      <Image source={icons.logo} className="w-20 h-10 mt-20 mb-3 mx-auto"/>
      <View className="px-5">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              placeholder='Search for a movie'
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>
          <TouchableOpacity onPress={() => setShowFilters(true)} className="bg-dark-100 p-3 rounded-full">
             <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Simple filter controls */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 12 }}>
          <TouchableOpacity onPress={() => setSortBy("popularity.desc")} className={`px-4 py-2 rounded-full ${sortBy === "popularity.desc" ? "bg-accent" : "bg-dark-100"}`}>
            <Text className={`${sortBy === "popularity.desc" ? "text-primary font-bold" : "text-white"}`}>Popular</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSortBy("vote_average.desc")} className={`px-4 py-2 rounded-full ${sortBy === "vote_average.desc" ? "bg-accent" : "bg-dark-100"}`}>
            <Text className={`${sortBy === "vote_average.desc" ? "text-primary font-bold" : "text-white"}`}>Top Rated</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSortBy("release_date.desc")} className={`px-4 py-2 rounded-full ${sortBy === "release_date.desc" ? "bg-accent" : "bg-dark-100"}`}>
            <Text className={`${sortBy === "release_date.desc" ? "text-primary font-bold" : "text-white"}`}>Latest</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setYear(new Date().getFullYear())} className={`px-4 py-2 rounded-full ${year ? "bg-accent" : "bg-dark-100"}`}>
            <Text className={`${year ? "text-primary font-bold" : "text-white"}`}>This Year</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setYear(undefined)} className={`px-4 py-2 rounded-full ${!year ? "bg-accent" : "bg-dark-100"}`}>
            <Text className={`${!year ? "text-primary font-bold" : "text-white"}`}>All Years</Text>
          </TouchableOpacity>
        </ScrollView>
        <Text className="text-lg text-white mt-5 mb-3">Latest Movies</Text>
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

      {moviesLoading ? (
        <ActivityIndicator 
          size="large"
          color="#0000ff"
          className="mt-10 self-center"
        />
      ) : moviesError ? (
        <Text className="p-5 text-red-500">Error: {moviesError?.message}</Text>
      ) : (
        <FlatList
          data={moviesList}
          renderItem={({ item }) => (
            <MovieCard {...item} type="movie" />
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