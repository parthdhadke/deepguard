import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="surface max-w-lg space-y-6 p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border/70 bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl tracking-[-0.03em]">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/detect">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Start Detection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}