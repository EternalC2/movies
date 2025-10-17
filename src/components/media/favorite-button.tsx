'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { MediaDetails } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface FavoriteButtonProps {
  media: MediaDetails;
  mediaType: 'movie' | 'tv';
}

export function FavoriteButton({ media, mediaType }: FavoriteButtonProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const collectionName = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteSeries';
  const docRef = useMemoFirebase(() =>
    user ? doc(firestore, 'users', user.uid, collectionName, String(media.id)) : null
  , [firestore, user, collectionName, media.id]);

  const { data: favoriteDoc, isLoading: isFavoriteLoading } = useDoc(docRef);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(!!favoriteDoc);
  }, [favoriteDoc]);

  const toggleFavorite = async () => {
    if (!user || !firestore || !docRef) {
      toast({
        title: 'Inloggen vereist',
        description: 'Je moet ingelogd zijn om favorieten toe te voegen.',
        variant: 'destructive',
      });
      return;
    }

    if (isFavorite) {
        deleteDoc(docRef).then(() => {
            toast({
                title: 'Verwijderd uit favorieten',
                description: `${media.title || media.name} is verwijderd uit je favorieten.`,
            });
            setIsFavorite(false);
        }).catch(error => {
            const contextualError = new FirestorePermissionError({
                operation: 'delete',
                path: docRef.path,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
    } else {
        const mediaData = {
            id: media.id,
            title: media.title || media.name,
            poster_path: media.poster_path,
            backdrop_path: media.backdrop_path,
            overview: media.overview,
            release_date: media.release_date || media.first_air_date,
            vote_average: media.vote_average,
            media_type: mediaType,
        };
        setDoc(docRef, mediaData).then(() => {
            toast({
                title: 'Toegevoegd aan favorieten!',
                description: `${media.title || media.name} is toegevoegd aan je favorieten.`,
            });
            setIsFavorite(true);
        }).catch(error => {
            const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: docRef.path,
                requestResourceData: mediaData
            });
            errorEmitter.emit('permission-error', contextualError);
        });
    }
  };
  
  const isLoading = isUserLoading || isFavoriteLoading;

  return (
    <Button size="lg" variant="outline" onClick={toggleFavorite} disabled={isLoading}>
      <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      {isLoading ? 'Laden...' : isFavorite ? 'Verwijder favoriet' : 'Toevoegen aan favorieten'}
    </Button>
  );
}
