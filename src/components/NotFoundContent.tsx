"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFoundContent() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <Image
              src="/logo/participium.svg"
              alt="Participium"
              width={240}
              height={240}
              className="dark:invert"
            />
            <h1 className="text-9xl font-bold text-foreground">
              404
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">Return to Website</Link>
        </Button>
      </div>
    </div>
  );
}
