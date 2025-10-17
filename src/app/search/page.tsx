
import { searchMedia } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { Media } from "@/lib/types";
import { Search } from "lucide-react";

type SearchPageProps = {
    searchParams: {
        q: string;
    }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q;
    const searchResults = await searchMedia(query);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">
                Zoekresultaten voor: <span className="text-primary">&quot;{query}&quot;</span>
            </h1>

            {searchResults.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg bg-card">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold text-foreground">Geen resultaten gevonden</p>
                    <p className="text-sm text-muted-foreground">Probeer het opnieuw met andere zoektermen.</p>
                </div>
            ) : (
                <MediaGrid media={searchResults.results as Media[]} mediaType="movie" />
            )}
        </div>
    )
}
