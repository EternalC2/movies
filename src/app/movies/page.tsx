import { getMovies } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { Media } from "@/lib/types";

export default async function MoviesPage() {
  const popularMovies = await getMovies('popular');

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-headline font-bold mb-6">Populaire Films</h1>
        <MediaGrid media={popularMovies.results as Media[]} mediaType="movie" />
      </section>
    </div>
  );
}
