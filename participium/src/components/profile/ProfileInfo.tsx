/**
 * Profile Info Display Component
 */

import React from "react";
import { UserIcon, Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getRoleIcon } from "./RoleIcon";
import { getRoleLabel, getRoleClasses } from "./utils/roleUtils";

interface ProfileInfoProps {
  firstName: string;
  lastName: string;
  username: string;
  role: string[];
  companyName?: string;
  isExternalMaintainer: boolean;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  firstName,
  lastName,
  username,
  role,
  companyName,
  isExternalMaintainer,
}) => {
  return (
    <div className="space-y-1 text-center sm:text-left flex-1 pt-2 w-full">
      <div className="grid grid-cols-2 gap-8 mb-3 px-1">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            First Name
          </Label>
          <span className="text-lg font-semibold text-foreground leading-none">
            {firstName || "-"}
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Last Name
          </Label>
          <span className="text-lg font-semibold text-foreground leading-none">
            {lastName || "-"}
          </span>
        </div>
      </div>
      {isExternalMaintainer && (
        <div className="grid grid-cols-1 gap-8 mb-3 px-1">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Company
            </Label>
            <span className="text-lg font-semibold text-foreground leading-none">
              {companyName || "Not assigned"}
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center sm:items-start gap-2 mt-2 px-1">
        <span className="text-muted-foreground text-sm font-medium flex items-center gap-1.5 font-mono">
          <UserIcon className="h-3.5 w-3.5" /> @{username}
        </span>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit",
            getRoleClasses(role)
          )}
        >
          {getRoleIcon(role)}
          {getRoleLabel(role)}
        </span>
      </div>
    </div>
  );
};
