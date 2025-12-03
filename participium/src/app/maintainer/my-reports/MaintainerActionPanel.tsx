"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { updateReportStatus } from "../../lib/controllers/report.controller";

interface MaintainerActionPanelProps {
  reportId: string | number;
  currentStatus: string;
  onActionComplete?: () => void;
}

const statusLabels: Record<string, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUSPENDED: "Suspended",
  RESOLVED: "Resolved",
};

// Allowed status transitions for maintainers
const allowedStatuses = ["IN_PROGRESS", "SUSPENDED", "RESOLVED"];

export default function MaintainerActionPanel({
  reportId,
  currentStatus,
  onActionComplete,
}: MaintainerActionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    currentStatus || "ASSIGNED"
  );

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return;

    setIsLoading(true);
    setFeedbackMessage(null);

    try {
      const response = await updateReportStatus(
        selectedStatus,
        String(reportId)
      );

      if (response.success) {
        setFeedbackMessage({
          type: "success",
          text: "Status updated successfully",
        });
        setTimeout(() => {
          onActionComplete?.();
        }, 1000);
      } else {
        setFeedbackMessage({
          type: "error",
          text: response.error || "Error updating status",
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: "error",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {feedbackMessage && (
        <div
          className={`p-3 rounded-md text-sm ${
            feedbackMessage.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground">
        Update Report Status
      </h3>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Current Status
          </label>
          <div className="p-2 bg-muted rounded-md text-sm font-medium">
            {statusLabels[currentStatus] || currentStatus}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            New Status
          </label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-9 text-sm bg-background">
              <SelectValue placeholder="Select new status..." />
            </SelectTrigger>
            <SelectContent className="z-9999">
              {allowedStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleUpdateStatus}
          disabled={
            isLoading || !selectedStatus || selectedStatus === currentStatus
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </Button>
      </div>

      <div className="p-3 bg-muted/50 rounded-md border border-dashed">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> You can change the report status to In
          Progress, Suspended, or Resolved based on the current work status.
        </p>
      </div>
    </div>
  );
}
