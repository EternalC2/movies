'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, writeBatch, setDoc } from 'firebase/firestore';
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

      if (!licenseSnap.exists()) {
        throw new Error('Licentiecode niet gevonden.');
      }

      const licenseData = licenseSnap.data();

      if (licenseData.status === 'claimed') {
        throw new Error('Deze licentiecode is al in gebruik.');
      }

      const batch = writeBatch(firestore);

      // Update license document
      const licenseUpdateData = {
        status: 'claimed',
        claimedBy: user.uid,
        claimedAt: new Date(),
      };
      batch.update(licenseRef, licenseUpdateData);
      
      // Update user document
      const userUpdateData = {
        licenseKey: trimmedLicenseKey,
      };
      // Use set with merge instead of update to avoid issues with hasOnly in rules
      batch.set(userRef, userUpdateData, { merge: true });

      await batch.commit().then(() => {
         toast({
            title: 'Succes!',
            description: 'Uw licentie is succesvol geactiveerd.',
         });
         setLicenseKey('');
      }).catch(error => {
          // This catch block will handle the batch commit error
          const contextualError = new FirestorePermissionError({
              operation: 'write', // A batch can contain multiple operations
              path: `BATCHED_WRITE: user: ${userRef.path}, license: ${licenseRef.path}`,
              requestResourceData: { userUpdate: userUpdateData, licenseUpdate: licenseUpdateData }
          });
          errorEmitter.emit('permission-error', contextualError);
      });

    } catch (error: any) {
      // This will catch the getDoc error or manual throws
      if (error.code === 'permission-denied') {
         const contextualError = new FirestorePermissionError({
              operation: 'get',
              path: licenseRef.path,
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
