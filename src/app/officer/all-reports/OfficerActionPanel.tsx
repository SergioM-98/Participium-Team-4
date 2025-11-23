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
  onActionComplete?: () => void;
}

export default function OfficerActionPanel({
  reportId,
  currentStatus,
  onActionComplete,
}: OfficerActionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Check if actionable
  const canModerate =
    currentStatus === "PENDING_APPROVAL" || currentStatus === "PENDING";

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

        {/* Approve Block */}
        <div className="grid gap-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <label className="text-sm font-medium">Assign Department</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEPT_ROADS">Roads & Maintenance</SelectItem>
                <SelectItem value="DEPT_POLICE">Local Police</SelectItem>
                <SelectItem value="DEPT_SANITATION">Sanitation</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleApprove}
              disabled={isLoading || !selectedDepartment || showRejectInput}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0"
            >
              {isLoading && !showRejectInput && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Approve
            </Button>
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
