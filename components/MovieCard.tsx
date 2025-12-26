import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

type MovieCardProps = Movie & {
  name?: string;
  first_air_date?: string;
  type?: "movie" | "tv";
};

const MovieCard = React.memo(({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  name,
  first_air_date,
  type = "movie",
}: MovieCardProps) => {
  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;

  return (
    <Link href={`/movies/${id}?type=${type}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {displayTitle}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {Math.round(vote_average / 2)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {displayDate?.split("-")[0]}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            {type === "movie" ? "Movie" : "TV"}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;