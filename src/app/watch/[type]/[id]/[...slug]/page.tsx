import { WatchPageClient } from '@/components/media/watch-page-client';

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
    <WatchPageClient 
        embedUrl={embedUrl}
        mediaId={id}
        mediaType={type}
        seasonNumber={season}
        episodeNumber={episode}
    />
  );
}
