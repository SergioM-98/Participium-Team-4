/**
 * Email Section Component
 */

import React from "react";
import { Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EmailSectionProps {
  email: string;
  isEditing: boolean;
  isPending: boolean;
  validationError: string | null;
  onEmailChange: (email: string) => void;
  onValidationErrorChange: (error: string | null) => void;
}

export const EmailSection: React.FC<EmailSectionProps> = ({
  email,
  isEditing,
  isPending,
  validationError,
  onEmailChange,
  onValidationErrorChange,
}) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label
        htmlFor="email"
        className={cn("flex items-center gap-2", isEditing && "text-primary")}
      >
        <Mail className="h-4 w-4" /> Email Address
      </Label>
      {isEditing ? (
        <>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value);
              if (validationError) onValidationErrorChange(null);
            }}
            placeholder="your@email.com"
            disabled={isPending}
            className={cn(
              validationError && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {validationError && (
            <p className="text-xs text-red-500 font-medium animate-pulse">
              {validationError}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
          {email || (
            <span className="text-muted-foreground italic">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
};
