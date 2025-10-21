'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, Timestamp } from 'firebase/firestore';
import { Spinner } from '@/components/ui/spinner';
import { WatchTracker } from './watch-tracker';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMediaDetails } from '@/lib/tmdb';
import type { MediaDetails } from '@/lib/types';

const servers = [
  { id: 'vidsrc', name: 'Server 1', url: 'https://vidsrc.to/embed' },
  { id: '2embed', name: 'Server 2', url: 'https://www.2embed.cc' },
  { id: 'godrive', name: 'Server 3', url: 'https://database.gdriveplayer.us/player.php' }
];

interface WatchPageClientProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
  seasonNumber?: string;
  episodeNumber?: string;
}

export function WatchPageClient({ mediaId, mediaType, seasonNumber, episodeNumber }: WatchPageClientProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState(servers[0].id);
  const [embedUrl, setEmbedUrl] = useState('');

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
      const hasLicense = !!userProfile?.licenseKey;
      const licenseNotExpired = userProfile?.licenseExpiresAt ? (userProfile.licenseExpiresAt as Timestamp).toDate() > new Date() : true;
      setIsAuthorized(hasLicense && licenseNotExpired);
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  useEffect(() => {
    async function fetchDetails() {
        if (mediaId && mediaType) {
            try {
                const details = await getMediaDetails(mediaType, mediaId);
                setMediaDetails(details);
            } catch (error) {
                console.error("Failed to fetch media details:", error);
            }
        }
    }
    fetchDetails();
  }, [mediaId, mediaType]);


  useEffect(() => {
    const server = servers.find(s => s.id === selectedServer);
    if (!server) return;

    let url: string;

    if (server.id === '2embed') {
      if (mediaType === 'movie') {
        url = `${server.url}/embed/${mediaId}`;
      } else { // tv
        const s = seasonNumber || '1';
        const e = episodeNumber || '1';
        url = `${server.url}/embedtv/${mediaId}&s=${s}&e=${e}`;
      }
    } else if (server.id === 'godrive') {
        // This server requires the IMDb ID, which we get from the mediaDetails.
        const imdbId = mediaDetails?.external_ids?.imdb_id;
        if (imdbId) {
            url = `${server.url}?imdb=${imdbId}`;
            if (mediaType === 'tv') {
                const s = seasonNumber || '1';
                const e = episodeNumber || '1';
                url += `&s=${s}&e=${e}`;
            }
        } else {
            // If we don't have the IMDb ID yet, we can't build the URL.
            // We'll show a loading or error state in the iframe area.
            url = ''; 
        }
    } else {
      // Default behavior for vidsrc and potentially others
      url = `${server.url}/${mediaType}/${mediaId}`;
      if (mediaType === 'tv') {
          const s = seasonNumber || '1';
          const e = episodeNumber || '1';
          url = `${url}/${s}/${e}`;
      }
    }
    setEmbedUrl(url);
  }, [selectedServer, mediaId, mediaType, seasonNumber, episodeNumber, mediaDetails]);

  const isLoading = isUserLoading || isProfileLoading || (selectedServer === 'godrive' && !mediaDetails);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Spinner size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-black p-4">
            <Alert variant="destructive" className="max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Geen Toegang</AlertTitle>
                <AlertDescription>
                    U heeft geen actieve of geldige licentie om deze content te bekijken. Activeer uw licentie op de accountpagina.
                    <Link href="/account" passHref>
                        <Button className="mt-4 w-full">Naar Accountpagina</Button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white antialiased">
      <WatchTracker
        mediaId={mediaId}
        mediaType={mediaType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
      />
      <header className="flex shrink-0 items-center justify-between p-4">
        <Link href={`/${mediaType}/${mediaId}`} passHref>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
        </Link>
        <div className="flex-grow flex justify-center">
             <Tabs value={selectedServer} onValueChange={setSelectedServer} className="w-auto">
                <TabsList>
                    {servers.map(server => (
                        <TabsTrigger key={server.id} value={server.id} disabled={server.id === 'godrive' && !mediaDetails?.external_ids?.imdb_id}>
                            {server.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
         <div className="w-24 flex-shrink-0"></div> {/* Spacer to balance the back button */}
      </header>
      <div className="flex-grow">
        {embedUrl ? (
            <iframe
            key={embedUrl} // IMPORTANT: Change key to force iframe reload
            src={embedUrl}
            title="Media Player"
            allowFullScreen
            className="w-full h-full border-0"
            ></iframe>
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                {selectedServer === 'godrive' && <p>Kon IMDb ID niet vinden. Probeer een andere server.</p>}
            </div>
        )}
      </div>
    </div>
  );
}
