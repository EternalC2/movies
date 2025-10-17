import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { Media } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { TMDB_IMAGE_URL } from "@/lib/config";
import { Badge } from "@/components/ui/badge";

interface MediaCardProps {
  media: Media & { href?: string };
  mediaType: 'movie' | 'tv';
}

export function MediaCard({ media, mediaType }: MediaCardProps) {
  const title = media.title || media.name || "No title";
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const score = media.vote_average ? media.vote_average.toFixed(1) : "N/A";
  const posterUrl = media.poster_path
    ? `${TMDB_IMAGE_URL}${media.poster_path}`
    : `https://picsum.photos/seed/${media.id}/500/750`;
  
  const href = media.href || `/${media.media_type || mediaType}/${media.id}`;

  return (
    <Link href={href}>
      <div className="group">
        <Card className="overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 border-transparent bg-transparent shadow-none">
          <CardContent className="p-0">
            <div className="aspect-[2/3] relative">
              <Image
                src={posterUrl}
                alt={title}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                data-ai-hint="movie poster"
              />
            </div>
          </CardContent>
        </Card>
        <div className="pt-3">
          <h3 className="font-bold font-headline truncate" title={title}>{title}</h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
            <span>{year}</span>
            {media.vote_average > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 border-yellow-400 text-yellow-400">
                <Star className="h-3 w-3 fill-current" />
                <span>{score}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
