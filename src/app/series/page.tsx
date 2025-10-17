import { getSeries } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { Media } from "@/lib/types";

export default async function SeriesPage() {
  const popularSeries = await getSeries('popular');

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-headline font-bold mb-6">Populaire Series</h1>
        <MediaGrid media={popularSeries.results as Media[]} mediaType="tv" />
      </section>
    </div>
  );
}
