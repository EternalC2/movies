import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Inloggen</CardTitle>
                    <CardDescription>
                        Voer je e-mailadres in om in te loggen op je account.
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
                    <Button className="w-full">Inloggen</Button>
                    <Button variant="outline" className="w-full">
                        Inloggen met Google
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        Nog geen account?{" "}
                        <Link href="/signup" className="underline hover:text-primary">
                            Registreren
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
