'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
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

    const licenseRef = doc(firestore, 'licenses', trimmedLicenseKey);
    const userRef = doc(firestore, 'users', user.uid);

    try {
        const licenseSnap = await getDoc(licenseRef);

        if (!licenseSnap.exists() || licenseSnap.data().status !== 'available') {
            throw new Error('Licentiecode is ongeldig of al in gebruik.');
        }

        // Create a batch to perform atomic update
        const batch = writeBatch(firestore);

        // 1. Update the user document
        const userUpdateData = { licenseKey: trimmedLicenseKey };
        batch.set(userRef, userUpdateData, { merge: true });
        
        // 2. Update the license document
        const licenseUpdateData = {
            status: 'claimed',
            claimedBy: user.uid,
            claimedAt: new Date(),
        };
        batch.update(licenseRef, licenseUpdateData);

        // Commit the batch
        await batch.commit();

        toast({
            title: 'Succes!',
            description: 'Uw licentie is succesvol geactiveerd.',
        });
        setLicenseKey('');

    } catch (error: any) {
        if (error.code === 'permission-denied') {
             const contextualError = new FirestorePermissionError({
                  operation: 'write', // The batch write failed
                  path: `BATCH: users/${user.uid} + licenses/${trimmedLicenseKey}`,
                  requestResourceData: { userUpdate: {licenseKey: trimmedLicenseKey}, licenseUpdate: { status: 'claimed' } }
              });
              errorEmitter.emit('permission-error', contextualError);
        } else {
            toast({
              title: 'Activeren mislukt',
              description: error.message || 'Er is een onbekende fout opgetreden.',
              variant: 'destructive',
            });
        }
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
