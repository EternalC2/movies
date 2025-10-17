'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function AccountPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
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

    if (isUserLoading) {
        return <div className="flex justify-center items-center h-screen">Laden...</div>;
    }

    if (!user) {
        return null; 
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-headline font-bold mb-6">Mijn Account</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profiel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={handleLogout}>Uitloggen</Button>
                         <Link href="/login">
                            <Button variant="outline">Wissel Account</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
