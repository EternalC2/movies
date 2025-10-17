import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Registreren</CardTitle>
                    <CardDescription>
                        Maak een account aan om je favorieten op te slaan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Wachtwoord</Label>
                        <Input id="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full">Account aanmaken</Button>
                     <Button variant="outline" className="w-full">
                        Registreren met Google
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        Al een account?{" "}
                        <Link href="/login" className="underline hover:text-primary">
                            Inloggen
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
