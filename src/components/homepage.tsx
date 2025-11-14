"use client";

import Link from "next/link";
import { Megaphone, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function StartingPage({ role }: { role: string }) {
  const { data: session, status } = useSession();
  const isLoggedIn = role && role !== "";

  if (status === "loading") {
    return (
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse space-y-4 w-full max-w-md">
                <div className="h-12 bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded-lg w-3/4"></div>
                <div className="grid grid-cols-3 gap-4 pt-8">
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (session && isLoggedIn) {
    return (
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            {/* Header Welcome */}
            <div className="mb-12 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Welcome, {session?.user?.name || "User"}!
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Thank you for choosing PARTICIPIUM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const services = [
    {
      icon: <User className="h-6 w-6" />,
      title: "Join us",
      description: "Join us in our mission to make Turin great",
      items: [
        "Create a user",
        "Signal problems",
        "Make the best out of our city",
      ],
      route: "/register",
    },
    {
      icon: <Megaphone className="h-6 w-6" />,
      title: "Report a problem",
      description:
        "Already a member? Use our tool to signal a problem to our operators",
      items: ["Potholes", "Broken lights", "Garbage displacement"],
      route: role == "" ? "/login" : role == "CITIZEN" ? "/reports" : "/",
    },
  ];

  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              PARTICIPIUM
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg tracking-tight md:text-xl">
              We collect your reviews to improve our city together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <Link
                key={index}
                className="border-border space-y-6 rounded-lg border p-8 transition-shadow hover:shadow-sm"
                href={service.route}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-full p-3">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <div className="bg-foreground h-1.5 w-1.5 rounded-full" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
