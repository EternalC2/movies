'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { doc, Timestamp } from 'firebase/firestore';
import { LicenseActivator } from '@/components/media/license-activator';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';

function getLicenseStatus(userProfile: any) {
    if (!userProfile?.licenseKey) {
        return { text: 'Inactief', color: 'text-yellow-500' };
    }
    if (userProfile.licenseExpiresAt) {
        const expiresDate = (userProfile.licenseExpiresAt as Timestamp).toDate();
        if (expiresDate < new Date()) {
            return { text: 'Verlopen', color: 'text-red-500' };
        }
        return { text: 'Actief', color: 'text-green-500' };
    }
    // Fallback for old licenses without an expiration
    return { text: 'Actief (onbeperkt)', color: 'text-green-500' };
}

export default function AccountPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    const userRef = useMemoFirebase(() => 
        user ? doc(firestore, 'users', user.uid) : null
    , [firestore, user]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

    useEffect(() => {
        // Wait until both user and profile loading are complete
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (isUserLoading || (user && isProfileLoading)) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="large" /></div>;
    }

    if (!user) {
        return null; 
    }

    const licenseStatus = getLicenseStatus(userProfile);
    const hasActiveLicense = licenseStatus.text.startsWith('Actief');

    return (
        <div className="max-w-md mx-auto space-y-8">
            <h1 className="text-3xl font-headline font-bold">Mijn Account</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profiel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Licentiestatus:</strong> <span className={licenseStatus.color}>{licenseStatus.text}</span></p>
                    {userProfile?.licenseExpiresAt && hasActiveLicense && (
                         <p><strong>Vervalt op:</strong> {format((userProfile.licenseExpiresAt as Timestamp).toDate(), 'd MMMM yyyy', { locale: nlBE })}</p>
                    )}

                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={handleLogout}>Uitloggen</Button>
                         <Link href="/login">
                            <Button variant="outline">Wissel Account</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {!hasActiveLicense && <LicenseActivator />}

        </div>
    );
}
