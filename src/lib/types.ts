export interface Media {
  id: number;
  title: string;
  name?: string; // for TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes?: Episode[];
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    still_path: string | null;
}

export interface MediaDetails extends Omit<Media, 'genre_ids' | 'name'> {
  genres: Genre[];
  credits?: {
    cast: CastMember[];
  };
  recommendations?: PaginatedResponse<Media>;
  // Movie specific
  runtime?: number;
  title: string;
  name?: string;
  release_date?: string;
  // TV specific
  episode_run_time?: number[];
  number_of_seasons?: number;
  first_air_date?: string;
  seasons?: Season[];
}

export interface Person {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    birthday: string | null;
    place_of_birth: string | null;
    known_for_department: string;
    combined_credits: {
        cast: (Media & { character: string })[];
    }
}

export interface PersonCredits {
    cast: (Media & { character: string })[];
}


export interface WatchProgress {
  id: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  lastWatchedAt: any;
  media?: MediaDetails;
}