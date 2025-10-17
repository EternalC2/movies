import { Star } from "lucide-react";

export default function FavoritesPage() {
    // TODO: This should be a protected route.
    // It should fetch favorite movies/series for the logged-in user from Firestore.
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">Mijn Favorieten</h1>
            <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg bg-card">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-foreground">Je hebt nog geen favorieten.</p>
                <p className="text-sm text-muted-foreground">Log in om films en series op te slaan en hier te bekijken.</p>
            </div>
        </div>
    );
}
