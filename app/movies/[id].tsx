import { fetchMovieDetails, fetchSeasonDetails, fetchTVDetails } from "@/api";
import { icons } from "@/constants/icons";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../services/usefetch";

const MovieDetails = () => {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // Limits for sections
  const [castLimit, setCastLimit] = useState(6);
  const [crewLimit, setCrewLimit] = useState(6);
  const [videoLimit, setVideoLimit] = useState(5);
  const [backdropLimit, setBackdropLimit] = useState(10);
  const [posterLimit, setPosterLimit] = useState(10);

  // Season State
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  // Favorites State
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const {
    data: movie,
    loading,
    error,
  } = useFetch(() => (type === "tv" ? fetchTVDetails(id as string) : fetchMovieDetails(id as string)), true);

  // Auto-load first season for TV shows
  useEffect(() => {
    if (type === "tv" && movie?.seasons && movie.seasons.length > 0 && selectedSeason === null) {
      const firstSeason = movie.seasons.find(s => s.season_number > 0) || movie.seasons[0];
      handleSeasonSelect(firstSeason.season_number);
    }
  }, [movie, type]);

  // Check if movie is favorited on load
  useEffect(() => {
    const checkFavorite = async () => {
      if (id) {
        const favorited = await isFavorite(
          Number(id),
          (type as "movie" | "tv") || "movie"
        );
        setIsFav(favorited);
      }
    };
    checkFavorite();
  }, [id, type]);

  const handleToggleFavorite = async () => {
    if (!movie || favLoading) return;
    setFavLoading(true);
    try {
      const title = movie.title ;
      const posterPath = movie.poster_path || "";
      const newFavState = await toggleFavorite(
        Number(id),
        (type as "movie" | "tv") || "movie",
        title,
        posterPath
      );
      setIsFav(newFavState);
      Alert.alert(
        newFavState ? "Added to Favorites" : "Removed from Favorites",
        newFavState
          ? `${title} has been added to your favorites.`
          : `${title} has been removed from your favorites.`
      );
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update favorites. Please try again.";
      Alert.alert(
        "Login Required",
        errorMessage.includes("login") 
          ? "Please login to add movies to your favorites." 
          : errorMessage
      );
    } finally {
      setFavLoading(false);
    }
  };

  const handleSeasonSelect = async (seasonNumber: number) => {
      if (selectedSeason === seasonNumber) {
          setSelectedSeason(null);
          setSeasonDetails(null);
          return;
      }
      setSelectedSeason(seasonNumber);
      setSeasonLoading(true);
      try {
          const details = await fetchSeasonDetails(id as string, seasonNumber);
          setSeasonDetails(details);
      } catch (e) {
          console.error(e);
      } finally {
          setSeasonLoading(false);
      }
  }

  // Watch providers now come from the appended movie details response
  const watchProviders = movie?.["watch/providers"] ?? null;
  const providersLoading = loading && !watchProviders;
  const providersError = null;

  // Only allow these region codes
  const allowedRegionCodes = ["US", "CA", "GB", "FR", "DE", "IT", "ES", "ZA"];

  // Compute available regions with flatrate providers, limited to allowed codes
  const availableRegions = React.useMemo(() => {
    if (!watchProviders?.results) return [];
    return Object.entries(watchProviders.results)
      .filter(([code, region]) => allowedRegionCodes.includes(code) && region.flatrate && region.flatrate.length > 0)
      .map(([code]) => code);
  }, [watchProviders]);

  // Map region codes to labels
  const regionLabels: Record<string, string> = {
    US: "US",
    CA: "Canada",
    GB: "UK",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    ES: "Spain",
    ZA: "South Africa",
  };

  React.useEffect(() => {
    if (availableRegions.length > 0 && !selectedRegion) {
      setSelectedRegion(availableRegions[0]);
    }
  }, [availableRegions, selectedRegion]);

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="w-full h-[450px] relative">
          <Image
            source={{
              uri: movie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
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

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={favLoading}
            className="absolute top-5 right-5 bg-dark-100 p-2 rounded-full"
          >
            {favLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Image
                source={icons.save}
                className="size-6"
                tintColor={isFav ? "#AB8BFF" : "white"}
              />
            )}
          </TouchableOpacity>

          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
        </View>

        <View className="px-5 -mt-10">
          <Text className="text-3xl font-bold text-white text-center">
            {movie?.title}
          </Text>

          <View className="flex-row justify-center items-center gap-x-3 mt-3">
            <View className="flex-row items-center gap-x-1">
              <Image source={icons.star} className="size-4" />
              <Text className="text-white font-bold text-sm">
                {Math.round((movie?.vote_average ?? 0) / 2)}
              </Text>
            </View>
            
            {movie?.runtime ? (
                <Text className="text-light-300 text-sm">
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </Text>
            ) : null}

            <Text className="text-light-300 text-sm">
                {movie?.release_date?.split("-")[0]}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-center gap-2 mt-5">
            {movie?.genres?.map((genre) => (
              <View
                key={genre.id}
                className="px-3 py-1 rounded-full border border-gray-700 bg-dark-200"
              >
                <Text className="text-light-300 text-xs">{genre.name}</Text>
              </View>
            ))}
          </View>

          <Text className="text-white text-lg font-bold mt-8 mb-3">
            Overview
          </Text>
          <Text className="text-light-300 leading-6">
            {movie?.overview}
          </Text>

          {/* Seasons Section (TV Only) */}
          {movie?.seasons && movie.seasons.length > 0 && (
            <View className="mt-8">
              <Text className="text-white text-lg font-bold mb-3">Seasons</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {movie.seasons.map((season) => (
                  <TouchableOpacity
                    key={season.id}
                    onPress={() => handleSeasonSelect(season.season_number)}
                    className={`mr-4 px-4 py-2 rounded-full border ${selectedSeason === season.season_number ? 'bg-secondary border-secondary' : 'bg-dark-200 border-gray-700'}`}
                  >
                    <Text className={selectedSeason === season.season_number ? 'text-white font-bold' : 'text-white'}>
                      {season.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {seasonLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : seasonDetails && selectedSeason !== null ? (
                <View className="gap-4">
                  {seasonDetails.episodes.map((episode) => (
                    <TouchableOpacity 
                        key={episode.id} 
                        className="flex-row gap-3 bg-dark-100 p-2 rounded-lg"
                        onPress={() => router.push({
                            pathname: "/tv/episode",
                            params: { tvId: id, seasonNumber: selectedSeason, episodeNumber: episode.episode_number }
                        })}
                    >
                      <Image
                        source={{
                          uri: episode.still_path
                            ? `https://image.tmdb.org/t/p/w185${episode.still_path}`
                            : "https://placehold.co/185x104/1a1a1a/FFFFFF.png",
                        }}
                        className="w-32 h-20 rounded"
                        resizeMode="cover"
                      />
                      <View className="flex-1 justify-center">
                        <Text className="text-white font-bold text-base mb-1">
                          {episode.episode_number}. {episode.name}
                        </Text>
                        <Text className="text-light-300 text-xs" numberOfLines={2}>
                          {episode.overview}
                        </Text>
                        <Text className="text-light-300 text-xs mt-1">
                            {episode.air_date} • {episode.runtime}m
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          )}

          {/* Quick Data Check (credits, videos, images) */}
          <View className="mt-6">
            <Text className="text-white text-base font-bold mb-2">Details Snapshot</Text>
            <View className="flex-row flex-wrap gap-4">
              <Text className="text-light-300">Cast: {movie?.credits?.cast?.length ?? 0}</Text>
              <Text className="text-light-300">Crew: {movie?.credits?.crew?.length ?? 0}</Text>
              <Text className="text-light-300">Videos: {movie?.videos?.results?.length ?? 0}</Text>
              <Text className="text-light-300">Backdrops: {movie?.images?.backdrops?.length ?? 0}</Text>
              <Text className="text-light-300">Posters: {movie?.images?.posters?.length ?? 0}</Text>
            </View>
          </View>

          {/* Cast Section */}
          {movie?.credits?.cast && movie.credits.cast.length > 0 ? (
            <View className="mt-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-lg font-bold">Cast</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => setCastLimit(Math.max(0, castLimit - 5))} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">- 5</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setCastLimit(castLimit + 5)} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">+ 5</Text></TouchableOpacity>
                  {movie.credits.cast.length > castLimit ? (
                    <TouchableOpacity onPress={() => setCastLimit(movie.credits.cast.length)} className="px-3 py-1 bg-dark-200 rounded-full"><Text className="text-white">Show all</Text></TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => setCastLimit(6)} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">Reset</Text></TouchableOpacity>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-4">
                {movie.credits.cast.slice(0, castLimit).map((member) => (
                  <TouchableOpacity
                    key={member.credit_id}
                    className="w-[30%] items-center"
                    onPress={() => Linking.openURL(`https://www.themoviedb.org/person/${member.id}`)}
                  >
                    <Image
                      source={{
                        uri: member.profile_path
                          ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                          : "https://placehold.co/200x300/1a1a1a/FFFFFF.png",
                      }}
                      className="w-20 h-28 rounded-lg"
                      resizeMode="cover"
                    />
                    <Text className="text-white text-xs font-semibold mt-2" numberOfLines={1}>{member.name}</Text>
                    <Text className="text-light-300 text-xs" numberOfLines={1}>{member.character}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Crew Section */}
          {movie?.credits?.crew && movie.credits.crew.length > 0 ? (
            <View className="mt-8">
              <View className="flex-row justify_between items-center mb-3">
                <Text className="text-white text-lg font-bold">Crew</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => setCrewLimit(Math.max(0, crewLimit - 5))} className="px-3 py-1 bg-dark-100 rounded_full"><Text className="text-white">- 5</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setCrewLimit(crewLimit + 5)} className="px-3 py-1 bg-dark-100 rounded_full"><Text className="text-white">+ 5</Text></TouchableOpacity>
                  {movie.credits.crew.length > crewLimit ? (
                    <TouchableOpacity onPress={() => setCrewLimit(movie.credits.crew.length)} className="px-3 py-1 bg-dark-200 rounded_full"><Text className="text-white">Show all</Text></TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => setCrewLimit(6)} className="px-3 py-1 bg-dark-100 rounded_full"><Text className="text-white">Reset</Text></TouchableOpacity>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-4">
                {movie.credits.crew.slice(0, crewLimit).map((member) => (
                  <View key={member.credit_id} className="w-[30%]">
                    <Text className="text-white text-xs font-semibold" numberOfLines={1}>{member.name}</Text>
                    <Text className="text-light-300 text-xs" numberOfLines={1}>{member.department} • {member.job}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Videos Section */}
          {movie?.videos?.results && movie.videos.results.length > 0 ? (
            <View className="mt-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-lg font-bold">Videos</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => setVideoLimit(Math.max(0, videoLimit - 5))} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">- 5</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setVideoLimit(videoLimit + 5)} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">+ 5</Text></TouchableOpacity>
                  {movie.videos.results.length > videoLimit ? (
                    <TouchableOpacity onPress={() => setVideoLimit(movie.videos.results.length)} className="px-3 py-1 bg-dark-200 rounded-full"><Text className="text-white">Show all</Text></TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => setVideoLimit(5)} className="px-3 py-1 bg-dark-100 rounded-full"><Text className="text-white">Reset</Text></TouchableOpacity>
                </View>
              </View>
              <View className="gap-3">
                {movie.videos.results.slice(0, videoLimit).map((vid) => (
                  <TouchableOpacity
                    key={vid.id}
                    className="flex-row items-center justify-between bg-dark-100 px-3 py-2 rounded-lg"
                    onPress={() => {
                      const url = vid.site.toLowerCase() === "youtube"
                        ? `https://www.youtube.com/watch?v=${vid.key}`
                        : `https://www.google.com/search?q=${encodeURIComponent(`${vid.name} ${vid.site}`)}`;
                      Linking.openURL(url);
                    }}
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-white text-sm" numberOfLines={1}>{vid.name}</Text>
                      <Text className="text-light-300 text-xs">{vid.type} • {vid.site}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Watch Providers Section */}
          <View className="mt-8">
            <Text className="text-white text-lg font-bold mb-3">
              Where to Watch
            </Text>
            {providersLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : providersError ? (
              <Text className="text-red-500">Error loading providers</Text>
            ) : !watchProviders ? (
              <Text className="text-light-300">No provider data returned. Try another movie to verify.</Text>
            ) : availableRegions.length === 0 ? (
              <Text className="text-light-300">No streaming providers found for this movie in any supported region.</Text>
            ) : (
              <>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {availableRegions.map((code) => (
                    <TouchableOpacity
                      key={code}
                      onPress={() => setSelectedRegion(code)}
                      className={`px-3 py-1 rounded-full border ${selectedRegion === code ? "bg-dark-200 border-white" : "border-gray-700 bg-dark-100"}`}
                    >
                      <Text className={`text-xs ${selectedRegion === code ? "text-white" : "text-light-300"}`}>{regionLabels[code] ?? code}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedRegion && watchProviders?.results?.[selectedRegion]?.flatrate ? (
                  <View className="flex-row flex-wrap gap-4">
                    {watchProviders.results[selectedRegion].flatrate.map((provider) => (
                      <View key={provider.provider_id} className="items-center">
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
                          }}
                          className="w-12 h-12 rounded-lg"
                          resizeMode="contain"
                        />
                        <Text className="text-light-300 text-xs mt-1 text-center w-16" numberOfLines={1}>
                          {provider.provider_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-light-300">No streaming providers found for this movie in {regionLabels[selectedRegion!] ?? selectedRegion}.</Text>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MovieDetails;