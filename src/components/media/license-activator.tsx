'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export function LicenseActivator() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!user || !firestore) {
      toast({
        title: 'Fout',
        description: 'U moet ingelogd zijn om een licentie te activeren.',
        variant: 'destructive',
      });
      return;
    }

    const trimmedLicenseKey = licenseKey.trim();
    if (!trimmedLicenseKey) {
      toast({
        title: 'Fout',
        description: 'Voer een geldige licentiecode in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const userRef = doc(firestore, 'users', user.uid);
    const licenseRef = doc(firestore, 'licenses', trimmedLicenseKey);

    try {
        const licenseSnap = await getDoc(licenseRef);
        
        if (!licenseSnap.exists() || licenseSnap.data().claimedBy) {
            toast({
                title: 'Activeren mislukt',
                description: 'De licentiecode is ongeldig of al in gebruik.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        const batch = writeBatch(firestore);
        
        // Update user profile
        batch.set(userRef, { licenseKey: trimmedLicenseKey }, { merge: true });
        
        // Update license document
        batch.update(licenseRef, {
            claimedBy: user.uid,
            claimedAt: serverTimestamp()
        });
        
        await batch.commit();

        toast({
            title: 'Succes!',
            description: 'Uw licentie is succesvol geactiveerd.',
        });
        setLicenseKey('');

    } catch (error: any) {
        const isPermissionError = error.code === 'permission-denied';
        if (isPermissionError) {
            const contextualError = new FirestorePermissionError({
                operation: 'write',
                path: `BATCH: users/${user.uid} + licenses/${trimmedLicenseKey}`,
                requestResourceData: {
                    userUpdate: { licenseKey: trimmedLicenseKey },
                    licenseUpdate: { claimedBy: user.uid }
                }
            });
            errorEmitter.emit('permission-error', contextualError);
        }
      
        toast({
            title: 'Activeren mislukt',
            description: 'De licentiecode is ongeldig, al in gebruik, of u heeft onvoldoende rechten.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Licentie Activeren</CardTitle>
        <CardDescription>
          Voer uw licentiecode in om toegang te krijgen tot alle films en series.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Uw licentiecode"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleActivate} disabled={loading} className="w-full">
          {loading ? 'Activeren...' : 'Activeren'}
        </Button>
      </CardContent>
    </Card>
  );
}
