import { TMDB_API_KEY, TMDB_API_URL } from './config';
import type { PaginatedResponse, Media, MediaDetails } from './types';

async function fetchFromTMDB<T>(endpoint: string, params: string = ''): Promise<T> {
  const url = `${TMDB_API_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=nl-BE&${params}`;

  const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
  }

  return response.json();
}

export async function getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<Media>> {
  return fetchFromTMDB<PaginatedResponse<Media>>(`trending/${mediaType}/${timeWindow}`);
}

export async function getMediaDetails(mediaType: 'movie' | 'tv', id: string): Promise<MediaDetails> {
  return fetchFromTMDB<MediaDetails>(`${mediaType}/${id}`, 'append_to_response=credits');
}

export async function searchMedia(query: string): Promise<PaginatedResponse<Media>> {
  const data = await fetchFromTMDB<PaginatedResponse<Media>>('search/multi', `query=${encodeURIComponent(query)}&include_adult=false`);
  // Filter out people from search results
  data.results = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  return data;
}

export async function getMovies(category: 'popular' | 'top_rated' | 'upcoming' = 'popular'): Promise<PaginatedResponse<Media>> {
  return fetchFromTMDB<PaginatedResponse<Media>>(`movie/${category}`);
}

export async function getSeries(category: 'popular' | 'top_rated' | 'on_the_air' = 'popular'): Promise<PaginatedResponse<Media>> {
  return fetchFromTMDB<PaginatedResponse<Media>>(`tv/${category}`);
}
