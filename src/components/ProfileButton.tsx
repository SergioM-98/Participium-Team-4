"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils"; // Importante per unire le classi se usi shadcn

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
  image,
  variant = "outline", 
  size = "sm",         
  className,
  showName = false,
}: ProfileButtonProps) {
  
  const initials = username
    ?.match(/(\b\S)?/g)
    ?.join("")
    ?.match(/(^\S|\S$)?/g)
    ?.join("")
    .toUpperCase() || "U";

  return (
    <Button 
      asChild 
      variant={variant} 
      size={size} 
      
      className={cn("gap-2", className)} 
    >
      <Link href="/profile">
        <Avatar className="h-5 w-5"> 
          <AvatarImage src={image || ""} alt={username || "User Avatar"} />
          <AvatarFallback className="text-[9px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        
        <span>{showName ? username : "Profile"}</span>
      </Link>
    </Button>
  );
}