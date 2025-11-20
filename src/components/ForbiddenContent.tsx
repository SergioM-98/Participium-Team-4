"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ForbiddenContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-foreground">
            403
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Forbidden
          </h2>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">Return to Website</Link>
        </Button>
      </div>
    </div>
  );
}
