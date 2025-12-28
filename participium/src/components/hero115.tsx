import { Wifi } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface HeroButton {
  title: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  href: string;
}

interface Hero115Props {
  icon?: React.ReactNode;
  heading: React.ReactNode;
  description: React.ReactNode;
  buttons: HeroButton[];
  imageSrc?: string;
  imageAlt?: string;
}

const Hero115 = ({
  icon = <Wifi className="size-6" />, 
  heading = "Blocks built with Shadcn & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttons = [],
  imageSrc,
  imageAlt,
}: Hero115Props) => {
  return (
    <section className="overflow-hidden min-h-screen h-screen flex items-center relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectFit: "cover", minHeight: '100vh' }}
      >
        <source src="/turin.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full gap-6 py-10">
        <div className="flex items-center justify-center">
          {icon}
        </div>
        <h2 className="max-w-5xl text-balance text-center text-3xl font-medium md:text-6xl">
          {heading}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-center md:text-lg">
          {description}
        </p>
        {buttons.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {buttons.map((button) => (
              <Link key={button.title} href={button.href}>
                <Button variant={button.variant || "default"} size="lg">
                  {button.title}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { Hero115 };
