'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
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

    const checkAndCreateUserProfile = async (userCred: UserCredential) => {
        if (!firestore) return;
        const user = userCred.user;
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // This will create the doc if it doesn't exist.
            // It's useful for users who signed up before the profile creation logic was in place.
            const userData = {
                id: user.uid,
                email: user.email,
                profilePictureUrl: user.photoURL || null,
                role: 'user', // Default role
                favoriteMovieIds: [],
                favoriteSeriesIds: [],
                licenseKey: null,
            };
            await setDoc(userRef, userData, { merge: true });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await checkAndCreateUserProfile(userCredential);
            router.push('/account');
        } catch (error: any) {
            console.error("Error signing in:", error);
            toast({
                title: "Inloggen mislukt",
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
            await checkAndCreateUserProfile(userCredential);
            router.push('/account');
        } catch (error: any) {
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('Google sign-in cancelled by user.');
                return; 
            }
            console.error("Error with Google sign in:", error);
            toast({
                title: "Google-login mislukt",
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
                <form onSubmit={handleLogin}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Inloggen</CardTitle>
                        <CardDescription>
                            Voer je e-mailadres in om in te loggen op je account.
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
                            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button" disabled={loading}>
                            Inloggen met Google
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Nog geen account?{" "}
                            <Link href="/signup" className="underline hover:text-primary">
                                Registreren
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
