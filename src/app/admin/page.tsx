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
import { Terminal, Copy, CalendarDays } from 'lucide-react';
import { Label } from '@/components/ui/label';


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
    const [durationDays, setDurationDays] = useState<number | undefined>(30);
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
        if (durationDays === undefined || durationDays <= 0) {
             toast({ title: "Fout", description: "Geldigheidsduur moet een positief getal zijn.", variant: 'destructive'});
            return;
        }
        if (!firestore) return;

        setLoading(true);
        const licenseData = {
            id: newLicenseKey,
            createdAt: serverTimestamp(),
            durationDays: durationDays,
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
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="md:col-span-2">
                             <Label htmlFor="licenseKey">Licentiecode</Label>
                             <div className="flex gap-2 mt-2">
                                <Input 
                                    id="licenseKey"
                                    value={newLicenseKey}
                                    onChange={(e) => setNewLicenseKey(e.target.value)}
                                    placeholder="Voer een licentiecode in of genereer er een"
                                    className="font-mono"
                                />
                                <Button onClick={handleCopy} variant="outline" size="icon" aria-label="Kopieer licentiecode"><Copy className="h-4 w-4"/></Button>
                            </div>
                         </div>
                         <div>
                            <Label htmlFor="duration">Geldigheidsduur (dagen)</Label>
                            <Input 
                                id="duration"
                                type="number"
                                value={durationDays ?? ''}
                                onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                placeholder="bv. 30"
                                className="mt-2"
                            />
                         </div>
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button onClick={() => setNewLicenseKey(generateLicenseKey())} variant="outline">Nieuwe Code</Button>
                         <Button onClick={handleCreateLicense} disabled={loading}>{loading ? 'Bezig...' : 'Licentie Aanmaken'}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
