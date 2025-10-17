import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WatchTracker } from '@/components/media/watch-tracker';

type Props = {
  params: {
    type: 'tv';
    id: string;
    slug: string[]; // [season, episode]
  };
};

export default function WatchEpisodePage({ params: { type, id, slug } }: Props) {
  const [season, episode] = slug;
  const embedUrl = `https://vidsrc-embed.ru/embed/${type}/${id}/${season}/${episode}`;

  return (
    <div className="fixed inset-0 bg-black flex flex-col antialiased">
       <WatchTracker mediaId={id} mediaType={type} seasonNumber={season} episodeNumber={episode} />
       <header className="p-4 flex items-center justify-between z-10 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0">
        <Link href={`/${type}/${id}`} passHref>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar serie
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
