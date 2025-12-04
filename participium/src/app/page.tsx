
"use client";
import { Hero115 } from "@/components/hero115";
import { Navbar1 } from "@/components/navbar1";
import { Feature43 } from "@/components/feature43";
import { MapPin, MessageCircle, Users, ShieldCheck, BarChart3} from "lucide-react";
import { TelegramIcon } from "@/components/TelegramIcon";

export default function HomePage() {
  return (
    <>
      <Navbar1 variant="homepage" />
      <Hero115
        icon={
          <img src="/logo/participium_white.svg" alt="Participium Logo" width={240} height={240} style={{ display: 'block' }} />
        }
        heading={<span className="text-white">Building a better Turin, one report at a time</span>}
        description={<span className="text-white">Take an active role in improving your city: report issues, suggest solutions, and contribute to positive change.</span>}
        buttons={[]}  
      />
      <Feature43
        title="Everything for our city"
        features={[
          {
            heading: "Geolocated reports",
            description: "Send precise reports about urban issues directly on the city map.",
            icon: <MapPin className="size-6" />,
          },
          {
            heading: "Dialogue with the Municipality",
            description: "Receive updates and answers from the competent offices about your reports.",
            icon: <MessageCircle className="size-6" />,
          },
          {
            heading: "Active community",
            description: "Join a community of citizens who want to improve Turin together.",
            icon: <Users className="size-6" />,
          },
          {
            heading: "Security and privacy",
            description: "Your data is protected and you can also report anonymously.",
            icon: <ShieldCheck className="size-6" />,
          },
          {
            heading: "Transparent statistics",
            description: "View data and results about reports and resolutions in the city.",
            icon: <BarChart3 className="size-6" />,
          },
          {
            heading: "Telegram integration",
            description: "Connect your account to our Telegram bot to receive real-time updates and send reports directly from the app you use every day.",
            icon: <TelegramIcon className="size-6" />, 
          },
        ]}
      />
    </>
  );
}