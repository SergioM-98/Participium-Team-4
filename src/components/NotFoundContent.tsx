"use client";

import { Button } from '@/components/ui/button';

export default function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-foreground">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => window.location.href = '/'}
          className="w-full sm:w-auto"
        >
          Return to Website
        </Button>
      </div>
    </div>
  );
}
