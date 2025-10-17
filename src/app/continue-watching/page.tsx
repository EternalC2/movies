'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { MediaGrid } from '@/components/media/media-grid';
import { WatchProgress, Media } from '@/lib/types';
import { History } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ContinueWatchingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const watchProgressRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'watchProgress'), orderBy('lastWatchedAt', 'desc')) : null
  , [firestore, user]);

  const { data: watchProgress, isLoading: progressLoading } = useCollection<WatchProgress>(watchProgressRef);
  
  if (isUserLoading || progressLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const mediaItems = watchProgress?.map(item => ({
      ...item.media,
      // The watch progress item itself has mediaType, but the embedded media might not.
      // We also construct a custom href to link back to the correct watch URL.
      media_type: item.mediaType,
      href: item.episodeNumber 
          ? `/watch/${item.mediaType}/${item.mediaId}/${item.seasonNumber}/${item.episodeNumber}`
          : `/watch/${item.mediaType}/${item.mediaId}`
  })) as (Media & {href: string})[] | undefined;


  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Verder Kijken</h1>
      
      {!mediaItems || mediaItems.length === 0 ? (
         <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg bg-card">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">Je hebt nog niets bekeken.</p>
            <p className="text-sm text-muted-foreground">Begin met het kijken van een film of serie om hier verder te kunnen gaan.</p>
        </div>
      ) : (
        <MediaGrid media={mediaItems as Media[]} mediaType="movie" />
      )}
    </div>
  );
}
