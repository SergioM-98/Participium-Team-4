"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getProfilePhotoUrl } from "@/app/lib/controllers/ProfilePhoto.controller";
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
}: ProfileButtonProps) {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);

  const initials = username
    ?.match(/(\b\S)?/g)
    ?.join("")
    ?.match(/(^\S|\S$)?/g)
    ?.join("")
    .toUpperCase() || "U";

  useEffect(() => {

    if (!initialImage && session?.user?.role === "CITIZEN") {
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
          <AvatarFallback className="text-[9px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {showName && <span>{username || "Profile"}</span>}
      </Link>
    </Button>
  );
}