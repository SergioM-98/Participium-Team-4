import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Feature {
  heading: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature43Props {
  title?: string;
  features?: Feature[];
  buttonText?: string;
  buttonUrl?: string;
}

const Feature43 = ({
  title = "Fully featured components for Shadcn UI & Tailwind",
  features = [
    {
      heading: "Quality",
      description:
        "Built with attention to detail and best practices. Every component is thoroughly tested and follows modern React patterns for reliability and performance.",
      icon: <GitPullRequest className="size-6" />,
    },
    {
      heading: "Experience",
      description:
        "Crafted with user experience in mind. Each component is designed to be intuitive, accessible, and provide smooth interactions across all devices.",
      icon: <SquareKanban className="size-6" />,
    },
    {
      heading: "Support",
      description:
        "Comprehensive documentation and community support. Get help when you need it with detailed guides, examples, and active community assistance.",
      icon: <RadioTower className="size-6" />,
    },
    {
      heading: "Innovation",
      description:
        "Cutting-edge design patterns and modern web technologies. Stay ahead with the latest trends in UI/UX design and development practices.",
      icon: <WandSparkles className="size-6" />,
    },
    {
      heading: "Results",
      description:
        "Proven track record of successful implementations. These components have been battle-tested in real-world applications and deliver consistent results.",
      icon: <Layers className="size-6" />,
    },
    {
      heading: "Efficiency",
      description:
        "Optimized for performance and developer productivity. Lightweight, fast-loading components that help you build faster without compromising on quality.",
      icon: <BatteryCharging className="size-6" />,
    },
  ],
  buttonText = "More Features",
  buttonUrl = "https://shadcnblocks.com",
}: Feature43Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-4">
        {title && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-pretty text-4xl font-medium lg:text-5xl">
              {title}
            </h2>
          </div>
        )}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col">
              <div className="bg-accent mb-5 flex size-16 items-center justify-center rounded-full mx-auto md:mx-0">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center md:text-left">{feature.heading}</h3>
              <p className="text-muted-foreground text-center md:text-left">{feature.description}</p>
            </div>
          ))}
        </div>
        {/* Button removed as requested */}
      </div>
    </section>
  );
};

export { Feature43 };
