import { getTrending } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { Media } from "@/lib/types";

export default async function Home() {
  const trendingMovies = await getTrending('movie', 'week');
  const trendingSeries = await getTrending('tv', 'week');

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-headline font-bold mb-6">Trending Films</h1>
        <MediaGrid media={trendingMovies.results as Media[]} mediaType="movie" />
      </section>
      <section>
        <h2 className="text-3xl font-headline font-bold mb-6">Trending Series</h2>
        <MediaGrid media={trendingSeries.results as Media[]} mediaType="tv" />
      </section>
    </div>
  );
}
