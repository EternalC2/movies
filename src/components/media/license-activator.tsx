'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

    if (!licenseKey.trim()) {
      toast({
        title: 'Fout',
        description: 'Voer een geldige licentiecode in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const licenseRef = doc(firestore, 'licenses', licenseKey.trim());
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

      // Use a batch to perform atomic write
      const batch = writeBatch(firestore);

      // Update license status
      batch.update(licenseRef, {
        status: 'claimed',
        claimedBy: user.uid,
        claimedAt: new Date(),
      });

      // Update user document with license key
      batch.update(userRef, {
        licenseKey: licenseKey.trim(),
      });

      await batch.commit();

      toast({
        title: 'Succes!',
        description: 'Uw licentie is succesvol geactiveerd.',
      });
      setLicenseKey('');
    } catch (error: any) {
      console.error('License activation error:', error);
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
