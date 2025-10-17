'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { doc } from 'firebase/firestore';
import { LicenseActivator } from '@/components/media/license-activator';
import { Spinner } from '@/components/ui/spinner';

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

    return (
        <div className="max-w-md mx-auto space-y-8">
            <h1 className="text-3xl font-headline font-bold">Mijn Account</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profiel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Licentiestatus:</strong> {userProfile?.licenseKey ? <span className="text-green-500">Actief</span> : <span className="text-yellow-500">Inactief</span>}</p>

                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={handleLogout}>Uitloggen</Button>
                         <Link href="/login">
                            <Button variant="outline">Wissel Account</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {!userProfile?.licenseKey && <LicenseActivator />}

        </div>
    );
}
