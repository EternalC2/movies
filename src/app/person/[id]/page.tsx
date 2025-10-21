import { getPersonDetails } from '@/lib/tmdb';
import Image from 'next/image';
import { TMDB_IMAGE_URL } from '@/lib/config';
import { Card } from '@/components/ui/card';
import { User, Cake, MapPin } from 'lucide-react';
import { MediaGrid } from '@/components/media/media-grid';
import { Media } from '@/lib/types';

type Props = {
  params: { id: string };
};

export default async function PersonDetailsPage({ params }: Props) {
  const person = await getPersonDetails(params.id);

  const profileUrl = person.profile_path
    ? `${TMDB_IMAGE_URL}${person.profile_path}`
    : `https://picsum.photos/seed/person-${person.id}/500/750`;

  const filmography = person.combined_credits.cast
    .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
    .sort((a, b) => (b.release_date || b.first_air_date || '0').localeCompare(a.release_date || a.first_air_date || '0')) // Sort by date descending
    .filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.media_type === v.media_type)) === i) // Remove duplicates
    .slice(0, 30);


  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        <div className="md:col-span-1 lg:col-span-1">
          <Card className="overflow-hidden shadow-2xl shadow-black/50 aspect-[2/3] relative">
            <Image
              src={profileUrl}
              alt={person.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              data-ai-hint="person headshot"
            />
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">{person.name}</h1>
          
          <div className="flex flex-col gap-3 text-muted-foreground">
             <div className="flex items-center gap-3">
                <User className="h-5 w-5"/>
                <span className="text-foreground">{person.known_for_department}</span>
             </div>
             {person.birthday && (
                <div className="flex items-center gap-3">
                    <Cake className="h-5 w-5"/>
                    <span>{new Date(person.birthday).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
             )}
             {person.place_of_birth && (
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5"/>
                    <span>{person.place_of_birth}</span>
                </div>
             )}
          </div>
          
          {person.biography && (
            <div>
              <h2 className="text-2xl font-headline font-semibold mb-2">Biografie</h2>
              <p className="text-muted-foreground leading-relaxed max-h-60 overflow-y-auto">
                {person.biography}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {filmography.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-bold mb-6">Bekend van</h2>
           <MediaGrid media={filmography as Media[]} mediaType="movie" />
        </section>
      )}
    </div>
  );
}