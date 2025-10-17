import { MediaCard } from "./media-card";
import { Media } from "@/lib/types";

interface MediaGridProps {
  media: Media[];
  mediaType: 'movie' | 'tv';
}

export function MediaGrid({ media, mediaType }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} mediaType={mediaType === 'movie' ? 'movie' : 'tv'} />
      ))}
    </div>
  );
}
