'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
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
      await runTransaction(firestore, async (transaction) => {
        const licenseSnap = await transaction.get(licenseRef);

        if (!licenseSnap.exists()) {
          throw new Error('Licentiecode is ongeldig.');
        }

        const licenseData = licenseSnap.data();
        if (licenseData.claimedBy) {
          throw new Error('Licentiecode is al in gebruik.');
        }

        // Update user profile
        transaction.set(userRef, { licenseKey: trimmedLicenseKey }, { merge: true });
        
        // Update license document
        transaction.update(licenseRef, {
            claimedBy: user.uid,
            claimedAt: serverTimestamp()
        });
      });

      toast({
        title: 'Succes!',
        description: 'Uw licentie is succesvol geactiveerd.',
      });
      setLicenseKey('');

    } catch (error: any) {
        const isPermissionError = error.code === 'permission-denied';

        // Create a detailed error for permission issues
        if (isPermissionError) {
          const contextualError = new FirestorePermissionError({
            operation: 'write', // A transaction is a write operation
            path: `TRANSACTION: users/${user.uid} + licenses/${trimmedLicenseKey}`,
            requestResourceData: {
              userUpdate: { licenseKey: trimmedLicenseKey },
              licenseUpdate: { claimedBy: user.uid }
            }
          });
          errorEmitter.emit('permission-error', contextualError);
        }
      
        // Show a user-friendly toast for any kind of error
        toast({
            title: 'Activeren mislukt',
            description: error.message || 'Er is een onbekende fout opgetreden.',
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
