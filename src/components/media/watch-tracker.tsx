'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getMediaDetails } from '@/lib/tmdb';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface WatchTrackerProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
  seasonNumber?: string;
  episodeNumber?: string;
}

export function WatchTracker({ mediaId, mediaType, seasonNumber, episodeNumber }: WatchTrackerProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const updateWatchProgress = async () => {
      if (user && firestore) {
        const media = await getMediaDetails(mediaType, mediaId);
        
        const progressRef = doc(firestore, 'users', user.uid, 'watchProgress', mediaId);
        
        const progressData: any = {
          mediaId,
          mediaType,
          lastWatchedAt: serverTimestamp(),
          media: {
              id: media.id,
              title: media.title || media.name,
              poster_path: media.poster_path,
              backdrop_path: media.backdrop_path,
              overview: media.overview,
              release_date: media.release_date || media.first_air_date,
              vote_average: media.vote_average,
              media_type: mediaType,
          }
        };

        if (mediaType === 'tv' && seasonNumber && episodeNumber) {
          progressData.seasonNumber = parseInt(seasonNumber, 10);
          progressData.episodeNumber = parseInt(episodeNumber, 10);
        }
        
        setDoc(progressRef, progressData, { merge: true }).catch(error => {
            const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: progressRef.path,
                requestResourceData: progressData
            });
            errorEmitter.emit('permission-error', contextualError);
        });
      }
    };

    updateWatchProgress();
  }, [user, firestore, mediaId, mediaType, seasonNumber, episodeNumber]);

  return null; // This component doesn't render anything
}
