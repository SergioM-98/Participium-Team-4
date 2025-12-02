"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../app/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { getProfilePhotoUrl } from "../app/lib/controllers/ProfilePhoto.controller";
import { useSession } from "next-auth/react";

interface ProfileButtonProps {
  username?: string;
  image?: string; 
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showName?: boolean; 
}

export function ProfileButton({
  username,
  image: initialImage,
  variant = "outline", 
  size = "sm",         
  className,
  showName = false,
}: Readonly<ProfileButtonProps>) {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);


  const initials = useMemo(() => {
    if (!username) return "U";

    return username.substring(0, 2).toUpperCase();
  }, [username]);


  const avatarStyle = useMemo(() => {
    if (!username) return {};
    const chartColors = [
      "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"
    ];

    const name = username;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colorVar = chartColors[Math.abs(hash % chartColors.length)];
    
    return {
        backgroundColor: `oklch(${colorVar})`,
        color: "oklch(var(--primary-foreground))"
    };
  }, [username]);

  useEffect(() => {
    if (!initialImage && session?.user) {
      getProfilePhotoUrl()
        .then((url) => setImageUrl(url))
        .catch(() => {

        });
    } else if (initialImage) {
        setImageUrl(initialImage);
    }
  }, [initialImage, session]);

  return (
    <Button 
      asChild 
      variant={variant} 
      size={size} 
      className={cn("gap-2", className)} 
    >
      <Link href="/profile">
        <Avatar className="h-5 w-5"> 
          <AvatarImage src={imageUrl || ""} alt={username || "User Avatar"} />
          <AvatarFallback 
            className="text-[9px] font-bold" 
            style={avatarStyle}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {showName && <span>{username || "Profile"}</span>}
      </Link>
    </Button>
  );
}