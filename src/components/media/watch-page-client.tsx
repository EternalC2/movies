'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { Spinner } from '@/components/ui/spinner';
import { WatchTracker } from './watch-tracker';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface WatchPageClientProps {
  embedUrl: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  seasonNumber?: string;
  episodeNumber?: string;
}

export function WatchPageClient({ embedUrl, mediaId, mediaType, seasonNumber, episodeNumber }: WatchPageClientProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user && !isProfileLoading) {
      if (userProfile?.licenseKey) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Optional: Redirect immediately or show the message.
        // For a better user experience, we show a message.
        // router.push('/account'); 
      }
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="fixed inset-0 bg-black flex justify-center items-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
        <div className="fixed inset-0 bg-black flex justify-center items-center p-4">
            <Alert variant="destructive" className="max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Geen Toegang</AlertTitle>
                <AlertDescription>
                    U heeft geen actieve licentie om deze content te bekijken. Activeer uw licentie op de accountpagina.
                    <Link href="/account" passHref>
                        <Button className="mt-4 w-full">Naar Accountpagina</Button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col antialiased">
      <WatchTracker
        mediaId={mediaId}
        mediaType={mediaType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
      />
      <header className="p-4 flex items-center justify-between z-10 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0">
        <Link href={`/${mediaType}/${mediaId}`} passHref>
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
