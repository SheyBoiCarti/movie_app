export const TMDB_CONFIG ={
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
    }
}

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
}: {
  query: string;
  page?: number;
  sortBy?: string;
  year?: number | undefined;
}): Promise<MovieListResponse> => {

    try{
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(page));

        let endpoint: string;
        if (query && query.trim().length > 0) {
          searchParams.set("query", query);
          endpoint = `${TMDB_CONFIG.BASE_URL}/search/movie?${searchParams.toString()}`;
        } else {
          // Common discover filters
          searchParams.set("sort_by", sortBy);
          searchParams.set("include_adult", "false");
          searchParams.set("include_video", "false");

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
          } else {
            // No specific year: still exclude future releases
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
}: {
  query: string;
  page?: number;
  sortBy?: string;
  year?: number | undefined;
}): Promise<TVListResponse> => {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));

    let endpoint: string;
    if (query && query.trim().length > 0) {
      searchParams.set("query", query);
      endpoint = `${TMDB_CONFIG.BASE_URL}/search/tv?${searchParams.toString()}`;
    } else {
      searchParams.set("sort_by", sortBy);
      searchParams.set("include_adult", "false");

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      if (year) {
        const startStr = `${year}-01-01`;
        searchParams.set("first_air_date.gte", startStr);
        searchParams.set("first_air_date.lte", todayStr);
      } else {
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

