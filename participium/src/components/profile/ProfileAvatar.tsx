/**
 * Profile Avatar Section Component
 */

import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  imageUrl: string | null;
  username: string;
  avatarStyle: React.CSSProperties;
  isEditing: boolean;
  onFileSelect: (file: File) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  username,
  avatarStyle,
  isEditing,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
        <AvatarImage
          src={imageUrl || ""}
          alt={username}
          className="object-cover"
        />
        <AvatarFallback className="text-2xl font-bold" style={avatarStyle}>
          {username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {isEditing && (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change profile picture"
        >
          <Camera className="h-8 w-8 text-white" />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </button>
      )}
    </div>
  );
};
