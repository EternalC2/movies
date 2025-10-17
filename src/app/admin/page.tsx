'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

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

    const licensesRef = useMemoFirebase(() => collection(firestore, 'licenses'), [firestore]);
    const { data: licenses, isLoading: licensesLoading } = useCollection(licensesRef);


    useEffect(() => {
        // Wait until both user and profile loading are complete
        if (!isUserLoading && !isProfileLoading) {
            if (!user) {
                // If not logged in after loading, redirect
                router.push('/login');
            } else if (userProfile?.role !== 'admin') {
                // If logged in but not an admin, show toast and redirect
                toast({ title: "Geen toegang", description: "U heeft geen toestemming om deze pagina te bekijken.", variant: 'destructive' });
                router.push('/account');
            }
        }
    }, [user, isUserLoading, userProfile, isProfileLoading, router, toast]);


    const handleCreateLicense = () => {
        if (!newLicenseKey.trim()) {
            toast({ title: "Fout", description: "Licentiecode mag niet leeg zijn.", variant: 'destructive'});
            return;
        }
        if (!firestore) return;

        setLoading(true);
        const licenseData = {
            id: newLicenseKey,
            status: 'available',
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


    if (isUserLoading || isProfileLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="large" /></div>;
    }

    if (!user || userProfile?.role !== 'admin') {
        // This will be shown briefly before the redirect in useEffect triggers, or if the redirect fails.
        return null;
    }

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
                    />
                    <Button onClick={() => setNewLicenseKey(generateLicenseKey())} variant="outline">Genereer</Button>
                    <Button onClick={handleCreateLicense} disabled={loading}>{loading ? 'Bezig...' : 'Aanmaken'}</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bestaande Licenties</CardTitle>
                </CardHeader>
                <CardContent>
                    {licensesLoading ? <Spinner /> : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Licentiecode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Geclaimd door</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {licenses?.map((license) => (
                                    <TableRow key={license.id}>
                                        <TableCell className="font-mono">{license.id}</TableCell>
                                        <TableCell>
                                            <Badge variant={license.status === 'claimed' ? 'destructive' : 'default'}>
                                                {license.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{license.claimedBy || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
