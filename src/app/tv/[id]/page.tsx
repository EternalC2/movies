
import Image from "next/image";
import Link from "next/link";
import { getMediaDetails } from "@/lib/tmdb";
import { TMDB_BACKDROP_URL, TMDB_IMAGE_URL } from "@/lib/config";
import { Star, Calendar, Tv, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TVDetailsClient } from "./tv-details-client";
import { FavoriteButton } from "@/components/media/favorite-button";

type Props = {
  params: { id: string };
};

export default async function TVDetailsPage({ params: { id } }: Props) {
  const series = await getMediaDetails("tv", id);

  if (!series) {
    return <div className="flex justify-center items-center h-screen">Laden...</div>;
  }

  const title = series.title || series.name;

  const year = series.first_air_date
    ? new Date(series.first_air_date).getFullYear()
    : "N/A";
  const score = series.vote_average ? series.vote_average.toFixed(1) : "N/A";

  const posterUrl = series.poster_path
    ? `${TMDB_IMAGE_URL}${series.poster_path}`
    : `https://picsum.photos/seed/${series.id}/500/750`;

  const backdropUrl = series.backdrop_path
    ? `${TMDB_BACKDROP_URL}${series.backdrop_path}`
    : `https://picsum.photos/seed/bg-${series.id}/1280/720`;

  return (
    <div className="space-y-8">
      <div className="relative h-[30vh] md:h-[50vh] w-[100vw] left-1/2 -translate-x-1/2 top-0 -mt-8">
        <Image
          src={backdropUrl}
          alt={`Backdrop for ${title}`}
          fill
          className="object-cover object-top"
          priority
          data-ai-hint="series backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 -mt-32 md:-mt-48 relative z-10">
        <div className="md:col-span-1 lg:col-span-1">
          <Card className="overflow-hidden shadow-2xl shadow-black/50 aspect-[2/3] relative">
              <Image
                src={posterUrl}
                alt={title!}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                data-ai-hint="series poster"
              />
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">{title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-bold text-lg text-foreground">{score}</span>
            </div>
            <span className="hidden md:inline">|</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{year}</span>
            </div>
            {series.number_of_seasons && (
              <>
                <span className="hidden md:inline">|</span>
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5" />
                  <span>{series.number_of_seasons} seizoen{series.number_of_seasons > 1 ? 'en' : ''}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {series.genres.map((genre) => (
              <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-headline font-semibold mb-2">Overzicht</h2>
            <p className="text-muted-foreground leading-relaxed">{series.overview}</p>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <Link href={`/watch/tv/${series.id}/1/1`}>
                <Button size="lg">
                    <Play className="mr-2 h-5 w-5"/>
                    Afspelen
                </Button>
            </Link>
            <FavoriteButton media={series} mediaType="tv" />
          </div>
        </div>
      </div>

      <TVDetailsClient series={series} />
      
    </div>
  );
}
