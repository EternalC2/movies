import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'CineVerse',
  description: 'Your universe of movies and series.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M83.4 25L12.5 45.8l-3.7-10c-1.2-4.6 1.2-9.2 5.4-10.4L57.7 11.9c4.6-1.2 9.2 1.2 10.4 5.4Z' fill='%2314b8a6'/><path d='m25.8 22.1 12.9 16.2'/><path d='m51.7 15 12.9 16.7'/><path d='M12.5 45.8h75v33.4a8.3 8.3 0 0 1-8.3 8.3H20.8a8.3 8.3 0 0 1-8.3-8.3Z' fill='%2314b8a6'/></svg>" />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <FirebaseClientProvider>
          <Header />
          <main className="container py-8">
              {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
