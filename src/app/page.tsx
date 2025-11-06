"use client";

import { Code, Cog, Megaphone, PenTool, Shrub, User } from "lucide-react";


export default function homePage(){
  return (
    <div className="flex items-center justify-center">
      <Services4/>
    </div>
  );
}

const Services4 = () => {
  const services = [
    
    {
      icon: <User className="h-6 w-6" />,
      title: "Join us",
      description:
        "Join us in our mission to make Turin great again",
      items: ["Create a user", "Signal problems", "Make the best out of our city"],
    },
    {
      icon: <Megaphone className="h-6 w-6" />,
      title: "Signal a problem",
      description:
        "Already a member? Ue our tool to signal a problem to our operetors",
      items: ["Potholes", "Brocken lights", "Garbage displacemente"],
    }
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
              We collect you reviews to improve our city together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="border-border space-y-6 rounded-lg border p-8 transition-shadow hover:shadow-sm"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Services4 };
