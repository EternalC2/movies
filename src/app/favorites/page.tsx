'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { MediaGrid } from '@/components/media/media-grid';
import { Media } from '@/lib/types';
import { Star } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const favoriteMoviesRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'favoriteMovies') : null
  , [firestore, user]);

  const favoriteSeriesRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'favoriteSeries') : null
  , [firestore, user]);

  const { data: favoriteMovies, isLoading: moviesLoading } = useCollection<Media>(favoriteMoviesRef);
  const { data: favoriteSeries, isLoading: seriesLoading } = useCollection<Media>(favoriteSeriesRef);

  if (isUserLoading || moviesLoading || seriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const hasFavorites = (favoriteMovies && favoriteMovies.length > 0) || (favoriteSeries && favoriteSeries.length > 0);

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Mijn Favorieten</h1>
      
      {!hasFavorites ? (
         <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg bg-card">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">Je hebt nog geen favorieten.</p>
            <p className="text-sm text-muted-foreground">Markeer films en series als favoriet om ze hier te bekijken.</p>
        </div>
      ) : (
        <div className="space-y-12">
            {favoriteMovies && favoriteMovies.length > 0 && (
                <section>
                    <h2 className="text-2xl font-headline font-bold mb-6">Favoriete Films</h2>
                    <MediaGrid media={favoriteMovies as Media[]} mediaType="movie" />
                </section>
            )}
            {favoriteSeries && favoriteSeries.length > 0 && (
                <section>
                    <h2 className="text-2xl font-headline font-bold mb-6">Favoriete Series</h2>
                    <MediaGrid media={favoriteSeries as Media[]} mediaType="tv" />
                </section>
            )}
        </div>
      )}
    </div>
  );
}
