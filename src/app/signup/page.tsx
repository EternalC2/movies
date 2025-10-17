'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/account');
        }
    }, [user, isUserLoading, router]);

    const createUserProfile = async (userCred: UserCredential) => {
        if (!firestore) return;
        const user = userCred.user;
        const userRef = doc(firestore, "users", user.uid);
        const userData = {
            id: user.uid,
            email: user.email,
            profilePictureUrl: user.photoURL || null,
            role: 'user', // Default role
            favoriteMovieIds: [],
            favoriteSeriesIds: [],
        };
        // Use setDoc with merge:true to be safe, although it's a new user.
        await setDoc(userRef, userData, { merge: true });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential);
            router.push('/account');
        } catch (error: any) {
            console.error("Error signing up:", error);
            toast({
                title: "Registratie mislukt",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            // Re-using createUserProfile which also works for initial Google sign-in
            await createUserProfile(userCredential);
            router.push('/account');
        } catch (error: any)
{
            console.error("Error with Google sign in:", error);
            toast({
                title: "Google-registratie mislukt",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isUserLoading || user) {
        return <div className="flex justify-center items-center h-screen">Laden...</div>;
    }

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSignup}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Registreren</CardTitle>
                        <CardDescription>
                            Maak een account aan om je favorieten op te slaan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Wachtwoord</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Bezig met registreren...' : 'Account aanmaken'}
                        </Button>
                         <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading} type="button">
                            Registreren met Google
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Al een account?{" "}
                            <Link href="/login" className="underline hover:text-primary">
                                Inloggen
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
