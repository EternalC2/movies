'use client';

import Image from "next/image";
import Link from "next/link";
import { getSeasonDetails } from "@/lib/tmdb";
import { TMDB_IMAGE_URL } from "@/lib/config";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { MediaDetails, Season } from "@/lib/types";

type Props = {
  series: MediaDetails;
};

export function TVDetailsClient({ series }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState('1');

  useEffect(() => {
    async function fetchSeason() {
      if (series) {
        const seasonDetails = await getSeasonDetails(String(series.id), selectedSeasonNumber);
        setSelectedSeason(seasonDetails);
      }
    }
    fetchSeason();
  }, [series, selectedSeasonNumber]);

  if (!series) {
    return null;
  }

  const seasons = series.seasons?.filter(s => s.season_number > 0) || [];

  return (
    <>
      {seasons.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-headline font-bold">Afleveringen</h2>
            <Select value={selectedSeasonNumber} onValueChange={setSelectedSeasonNumber}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecteer een seizoen" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={String(season.season_number)}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSeason?.episodes && (
            <div className="space-y-4">
              {selectedSeason.episodes.map((episode) => (
                <Card key={episode.id} className="flex items-start p-4 gap-4">
                  <div className="relative w-32 h-20 flex-shrink-0">
                    <Image
                        src={episode.still_path ? `${TMDB_IMAGE_URL}${episode.still_path}` : `https://picsum.photos/seed/ep-${episode.id}/200/100`}
                        alt={episode.name}
                        fill
                        className="object-cover rounded-md"
                        data-ai-hint="tv episode"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{episode.episode_number}. {episode.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{episode.overview}</p>
                  </div>
                  <Link href={`/watch/tv/${series.id}/${selectedSeason.season_number}/${episode.episode_number}`}>
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Afspelen
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {series.credits && series.credits.cast.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-bold mb-6">Cast</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {series.credits.cast.slice(0, 14).map((member) => (
              <Link href={`/person/${member.id}`} key={member.id} className="text-center group block">
                <Card className="overflow-hidden shadow-lg border-transparent bg-card aspect-[2/3] relative transition-all duration-300 group-hover:scale-105">
                    <Image
                      src={member.profile_path ? `${TMDB_IMAGE_URL}${member.profile_path}` : `https://picsum.photos/seed/cast-${member.id}/200/300`}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="33vw, (max-width: 640px) 25vw, (max-width: 1024px) 20vw, 14vw"
                      data-ai-hint="person headshot"
                    />
                </Card>
                <h3 className="font-semibold mt-2 text-sm truncate">{member.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{member.character}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}