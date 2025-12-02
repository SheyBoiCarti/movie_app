export const TMDB_CONFIG ={
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
    }
}

export type FilterOptions = {
  include_adult?: boolean;
  language?: string;
  region?: string;
  with_genres?: string;
  vote_average_gte?: number;
  vote_count_gte?: number;
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  with_keywords?: string;
  with_people?: string;
};

type MovieListResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export const FetchMovies = async ({
  query,
  page = 1,
  sortBy = "popularity.desc",
  year,
  filters,
}: {
  query: string;
  page?: number;
  sortBy?: string;
  year?: number | undefined;
  filters?: FilterOptions;
}): Promise<MovieListResponse> => {

    try{
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(page));

        let endpoint: string;
        if (query && query.trim().length > 0) {
          searchParams.set("query", query);
          // Search endpoint supports fewer filters, but we can add language/region/adult
          if (filters?.language) searchParams.set("language", filters.language);
          if (filters?.region) searchParams.set("region", filters.region);
          if (filters?.include_adult !== undefined) searchParams.set("include_adult", String(filters.include_adult));
          
          endpoint = `${TMDB_CONFIG.BASE_URL}/search/movie?${searchParams.toString()}`;
        } else {
          // Common discover filters
          searchParams.set("sort_by", sortBy);
          searchParams.set("include_adult", filters?.include_adult ? "true" : "false");
          searchParams.set("include_video", "false");

          // Default vote count to 100 to filter out spam entries
          if (filters?.vote_count_gte !== undefined) {
            searchParams.set("vote_count.gte", String(filters.vote_count_gte));
          } else {
            searchParams.set("vote_count.gte", "100");
          }

          // Apply advanced filters
          if (filters) {
            if (filters.language) searchParams.set("language", filters.language);
            if (filters.region) searchParams.set("region", filters.region);
            if (filters.with_genres) searchParams.set("with_genres", filters.with_genres);
            if (filters.vote_average_gte !== undefined) searchParams.set("vote_average.gte", String(filters.vote_average_gte));
            if (filters.primary_release_date_gte) searchParams.set("primary_release_date.gte", filters.primary_release_date_gte);
            if (filters.primary_release_date_lte) searchParams.set("primary_release_date.lte", filters.primary_release_date_lte);
            if (filters.with_keywords) searchParams.set("with_keywords", filters.with_keywords);
            if (filters.with_people) searchParams.set("with_people", filters.with_people);
          }

          // Exclude unreleased movies by limiting to today or earlier
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          const todayStr = `${yyyy}-${mm}-${dd}`;

          // For year filter, bound start to Jan 1 of that year and end to today
          if (year) {
            const startStr = `${year}-01-01`;
            searchParams.set("release_date.gte", startStr);
            searchParams.set("release_date.lte", todayStr);
          } else if (!filters?.primary_release_date_lte) {
            // No specific year and no custom date range: still exclude future releases
            searchParams.set("release_date.lte", todayStr);
          }
          endpoint = `${TMDB_CONFIG.BASE_URL}/discover/movie?${searchParams.toString()}`;
        }

        const response=await fetch(endpoint,{
        method: 'GET',
        headers: TMDB_CONFIG.headers})

        const data = await response.json();
        return data as MovieListResponse;
     
    }
        catch(error){
            console.error('Error fetching movies:', error);
            console.log(error);
            //@ts-ignore
            console.log(response.statusText);
          throw error;
        }
}

type TVShow = Movie; // reuse minimal fields used by UI (id, poster_path, name/title, vote_average)
type TVListResponse = {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
};

export const FetchTV = async ({
  query,
  page = 1,
  sortBy = "popularity.desc",
  year,
  filters,
}: {
  query: string;
  page?: number;
  sortBy?: string;
  year?: number | undefined;
  filters?: FilterOptions;
}): Promise<TVListResponse> => {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));

    let endpoint: string;
    if (query && query.trim().length > 0) {
      searchParams.set("query", query);
      if (filters?.language) searchParams.set("language", filters.language);
      if (filters?.include_adult !== undefined) searchParams.set("include_adult", String(filters.include_adult));
      
      endpoint = `${TMDB_CONFIG.BASE_URL}/search/tv?${searchParams.toString()}`;
    } else {
      searchParams.set("sort_by", sortBy);
      searchParams.set("include_adult", filters?.include_adult ? "true" : "false");

      // Apply advanced filters
      if (filters) {
        if (filters.language) searchParams.set("language", filters.language);
        if (filters.with_genres) searchParams.set("with_genres", filters.with_genres);
        if (filters.vote_average_gte !== undefined) searchParams.set("vote_average.gte", String(filters.vote_average_gte));
        if (filters.vote_count_gte !== undefined) searchParams.set("vote_count.gte", String(filters.vote_count_gte));
        if (filters.primary_release_date_gte) searchParams.set("first_air_date.gte", filters.primary_release_date_gte);
        if (filters.primary_release_date_lte) searchParams.set("first_air_date.lte", filters.primary_release_date_lte);
        if (filters.with_keywords) searchParams.set("with_keywords", filters.with_keywords);
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      if (year) {
        const startStr = `${year}-01-01`;
        searchParams.set("first_air_date.gte", startStr);
        searchParams.set("first_air_date.lte", todayStr);
      } else if (!filters?.primary_release_date_lte) {
        searchParams.set("first_air_date.lte", todayStr);
      }

      endpoint = `${TMDB_CONFIG.BASE_URL}/discover/tv?${searchParams.toString()}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: TMDB_CONFIG.headers
    });
    const data = await response.json();
    return data as TVListResponse;
  } catch (error) {
    console.error('Error fetching tv shows:', error);
    //@ts-ignore
    console.log(response?.statusText);
    throw error;
  }
}

export const fetchMovieDetails = async (
    movieId: string
  ): Promise<MovieDetails> => {
    try {
      const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?append_to_response=credits,videos,images,watch/providers`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch movie details: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      throw error;
    }
  };

export const fetchTVDetails = async (
  tvId: string
): Promise<MovieDetails> => {
  try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}?append_to_response=credits,videos,images,watch/providers`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tv details: ${response.statusText}`);
    }

    const data = await response.json();
    // Normalize fields to match MovieDetails interface used by UI
    return {
      ...data,
      title: data.name,
      release_date: data.first_air_date,
      runtime: data.episode_run_time?.[0] || 0,
    } as MovieDetails;
  } catch (error) {
    console.error("Error fetching tv details:", error);
    throw error;
  }
};

export const fetchWatchProviders = async (
  movieId: string
): Promise<WatchProvidersResponse> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch watch providers: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    throw error;
  }
};

export const fetchGenres = async (type: 'movie' | 'tv'): Promise<{ id: number; name: string }[]> => {
  try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/genre/${type}/list`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: TMDB_CONFIG.headers,
    });
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    return [];
  }
};

export const fetchSeasonDetails = async (
  tvId: string,
  seasonNumber: number
): Promise<SeasonDetails> => {
  try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching season details:", error);
    throw error;
  }
};

export const fetchEpisodeDetails = async (
  tvId: string,
  seasonNumber: number,
  episodeNumber: number
): Promise<Episode> => {
    try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch episode details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching episode details:", error);
    throw error;
  }
}

