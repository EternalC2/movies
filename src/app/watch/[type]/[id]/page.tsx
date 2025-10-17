import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WatchTracker } from '@/components/media/watch-tracker';

type Props = {
  params: {
    type: 'movie' | 'tv';
    id: string;
  };
};

// This page now handles routes like /watch/movie/123
// It does NOT handle season/episode routes, that is handled by the [...slug] version
export default function WatchPage({ params: { type, id } }: Props) {
  let embedUrl;

  if (type === 'movie') {
      embedUrl = `https://vidsrc-embed.ru/embed/movie/${id}`;
  } else {
      // Default to season 1, episode 1 for a series if not specified
      embedUrl = `https://vidsrc-embed.ru/embed/tv/${id}/1/1`;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col antialiased">
       <WatchTracker mediaId={id} mediaType={type} seasonNumber={type === 'tv' ? '1' : undefined} episodeNumber={type === 'tv' ? '1' : undefined} />
       <header className="p-4 flex items-center justify-between z-10 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0">
        <Link href={`/${type}/${id}`} passHref>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
        </Link>
      </header>
      <div className="flex-grow w-full h-full">
        <iframe
          src={embedUrl}
          title="Media Player"
          allowFullScreen
          className="w-full h-full border-0"
        ></iframe>
      </div>
    </div>
  );
}
