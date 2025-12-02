interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}



interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  seasons?: Season[];

  // Appended sub-objects
  credits: Credits;
  videos: Videos;
  images: Images;
  ["watch/providers"]: WatchProvidersResponse;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: CastMember[];
}

interface SeasonDetails extends Season {
    episodes: Episode[];
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface WatchProvidersByRegion {
  [key: string]: {
    link: string;
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
  };
}

interface WatchProvidersResponse {
  id: number;
  results: WatchProvidersByRegion;
}


// Sub-interfaces for appended responses (non-exported)
interface CastMember {
  cast_id?: number;
  character?: string;
  credit_id: string;
  gender: number | null;
  id: number;
  name: string;
  order?: number;
  profile_path: string | null;
}

interface CrewMember {
  credit_id: string;
  department?: string;
  job?: string;
  gender: number | null;
  id: number;
  name: string;
  profile_path: string | null;
}

interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string; // e.g., YouTube
  size: number; // e.g., 1080
  type: string; // e.g., Trailer
  official: boolean;
  published_at: string;
}

interface Videos {
  results: Video[];
}

interface Image {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
}

interface Images {
  backdrops: Image[];
  posters: Image[];
  logos?: Image[];
}

