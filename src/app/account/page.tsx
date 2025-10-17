import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AccountPage() {
    // TODO: This should be a protected route.
    // It should display user info and a logout button.
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-headline font-bold mb-6">Mijn Account</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profiel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Email:</strong> user@example.com (placeholder)</p>
                    <div className="flex gap-4">
                        <Button variant="destructive">Uitloggen</Button>
                         <Link href="/login">
                            <Button variant="outline">Wissel Account</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
