'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from '@/components/ui/spinner';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal, Copy } from 'lucide-react';


function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 25; i++) {
        if (i > 0 && i % 5 === 0) {
            result += '-';
        }
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [newLicenseKey, setNewLicenseKey] = useState(generateLicenseKey());
    const [loading, setLoading] = useState(false);
    
    const userRef = useMemoFirebase(() =>
        user ? doc(firestore, 'users', user.uid) : null
    , [firestore, user]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

    const handleCreateLicense = () => {
        if (!newLicenseKey.trim()) {
            toast({ title: "Fout", description: "Licentiecode mag niet leeg zijn.", variant: 'destructive'});
            return;
        }
        if (!firestore) return;

        setLoading(true);
        const licenseData = {
            id: newLicenseKey,
            createdAt: serverTimestamp()
        };
        const licenseRef = doc(firestore, 'licenses', newLicenseKey);

        setDoc(licenseRef, licenseData).then(() => {
            toast({ title: "Succes!", description: `Licentie ${newLicenseKey} is aangemaakt.`});
            setNewLicenseKey(generateLicenseKey());
        }).catch(error => {
            const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: licenseRef.path,
                requestResourceData: licenseData,
            });
            errorEmitter.emit('permission-error', contextualError);
        }).finally(() => {
            setLoading(false);
        });
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(newLicenseKey);
        toast({
            title: "Gekopieerd!",
            description: "De licentiecode is naar je klembord gekopieerd.",
        });
    }


    // Show a loading screen while we verify user and role.
    if (isUserLoading || isProfileLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="large" /></div>;
    }

    // After loading, check for authorization.
    if (!user) {
        // Not logged in, redirect to login. This can be done immediately.
        router.push('/login');
        return null;
    }

    if (!userProfile) {
        // User is logged in, but no profile was found. This is a critical error state.
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Profiel niet gevonden</AlertTitle>
                    <AlertDescription>
                        Kon uw gebruikersprofiel niet laden. Probeer opnieuw in te loggen.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (userProfile.role !== 'admin') {
        // User is logged in, has a profile, but is not an admin.
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Geen Toegang</AlertTitle>
                    <AlertDescription>
                        U heeft geen toestemming om deze pagina te bekijken.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Only if all checks pass, render the admin page content.
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-headline font-bold">Admin Paneel</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Nieuwe Licentie Aanmaken</CardTitle>
                    <CardDescription>Genereer en voeg een nieuwe licentiecode toe aan het systeem.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input 
                        value={newLicenseKey}
                        onChange={(e) => setNewLicenseKey(e.target.value)}
                        placeholder="Voer een licentiecode in of genereer er een"
                        className="font-mono"
                    />
                    <Button onClick={() => setNewLicenseKey(generateLicenseKey())} variant="outline">Genereer</Button>
                    <Button onClick={handleCopy} variant="outline" size="icon"><Copy className="h-4 w-4"/></Button>
                    <Button onClick={handleCreateLicense} disabled={loading}>{loading ? 'Bezig...' : 'Aanmaken'}</Button>
                </CardContent>
            </Card>
        </div>
    )
}
