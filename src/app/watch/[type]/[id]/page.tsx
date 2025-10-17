import { WatchPageClient } from '@/components/media/watch-page-client';

type Props = {
  params: {
    type: 'movie' | 'tv';
    id: string;
  };
};

// This page now handles routes like /watch/movie/123
// It does NOT handle season/episode routes, that is handled by the [...slug] version
export default function WatchPage({ params: { type, id } }: Props) {
  let seasonNumber;
  let episodeNumber;

  if (type === 'tv') {
      // Default to season 1, episode 1 for a series if not specified
      seasonNumber = '1';
      episodeNumber = '1';
  }

  return (
    <WatchPageClient 
        mediaId={id}
        mediaType={type}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
    />
  );
}
