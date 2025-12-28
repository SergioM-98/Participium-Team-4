/**
 * Office Section Component
 */

import React from "react";
import { Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface OfficeSectionProps {
  office: string[];
}

export const OfficeSection: React.FC<OfficeSectionProps> = ({ office }) => {
  if (!office || office.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <Label className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" /> Department / Office
      </Label>
      <div className="flex flex-wrap items-center min-h-12 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium text-foreground shadow-sm gap-2">
        {office.map((officeItem) => (
          <span key={officeItem} className="bg-primary/10 px-2 py-1 rounded">
            {officeItem.replaceAll("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
};
