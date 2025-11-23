"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { approveReport, rejectReport } from "@/controllers/report.controller";

interface OfficerActionPanelProps {
  reportId: string | number;
  currentStatus: string;
  currentCategory: string;
  onActionComplete?: () => void;
}

export default function OfficerActionPanel({
  reportId,
  currentStatus,
  currentCategory,
  onActionComplete,
}: OfficerActionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(currentCategory);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const canModerate =
    currentStatus === "pending_approval" || currentStatus === "PENDING";

  const handleApprove = async () => {
    if (!selectedDepartment) return;
    setIsLoading(true);
    try {
      const response = await approveReport(
        Number(reportId),
        selectedDepartment
      );
      if (response.success) {
        onActionComplete?.();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsLoading(true);
    try {
      const response = await rejectReport(Number(reportId), rejectionReason);
      if (response.success) {
        onActionComplete?.();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRejectInput(false);
    }
  };

  if (!canModerate) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center border border-dashed">
        <p className="text-sm text-muted-foreground">
          Action locked. Report status: <strong>{currentStatus}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Officer Actions
        </h3>

        {/* Approve / Assign Block */}
        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 space-y-4">
          {/* GRID LAYOUT: 3 Columns for side-by-side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Verify Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WATER_SUPPLY">Water Supply</SelectItem>
                  <SelectItem value="ARCHITECTURAL_BARRIERS">
                    Architectural Barriers
                  </SelectItem>
                  <SelectItem value="SEWER_SYSTEM">Sewer System</SelectItem>
                  <SelectItem value="PUBLIC_LIGHTING">
                    Public Lighting
                  </SelectItem>
                  <SelectItem value="WASTE">Waste</SelectItem>
                  <SelectItem value="ROADS_SIGNS_AND_TRAFFIC_LIGHTS">
                    Roads & Signs
                  </SelectItem>
                  <SelectItem value="ROADS_AND_URBAN_FURNISHINGS">
                    Roads & Furnishings
                  </SelectItem>
                  <SelectItem value="PUBLIC_GREEN_AREAS_AND_BACKGROUNDS">
                    Green Areas
                  </SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Department Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assign Department
              </label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPARTMENT_OF_COMMERCE">
                    Commerce
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_EDUCATIONAL_SERVICES">
                    Educational Services
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES">
                    Decentralization
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES">
                    Social Health
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_INTERNAL_SERVICES">
                    Internal Services
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION">
                    Culture & Sport
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_FINANCIAL_RESOURCES">
                    Financial Resources
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES">
                    General Services
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES">
                    Maintenance
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING">
                    Urban Planning
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY">
                    Environment
                  </SelectItem>
                  <SelectItem value="DEPARTMENT_OF_LOCAL_POLICE">
                    Local Police
                  </SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Approve Button */}
            <div className="flex items-end">
              <Button
                onClick={handleApprove}
                disabled={isLoading || !selectedDepartment || showRejectInput}
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                {isLoading && !showRejectInput ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Approve & Assign
              </Button>
            </div>
          </div>
        </div>

        {/* Reject Block */}
        <div className="p-4 border rounded-lg bg-red-50/30 border-red-100 dark:border-red-900/20 dark:bg-red-900/10">
          {!showRejectInput ? (
            <Button
              variant="destructive"
              onClick={() => setShowRejectInput(true)}
              disabled={isLoading}
              className="w-full"
            >
              Reject Report
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
              <label className="text-sm font-medium text-destructive">
                Reason for Rejection
              </label>
              <Textarea
                placeholder="Please explain why..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-background"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectInput(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  disabled={isLoading || !rejectionReason.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
