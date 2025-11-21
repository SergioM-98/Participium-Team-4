"use client";

import * as React from "react";
import { X, MapPin, Image, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- PLACEHOLDER TYPES AND CONSTANTS (for self-containment) ---
// Note: These must match the types used in the AllReportsList component exactly.

export const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;
export type ReportStatus = keyof typeof STATUS;
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}
export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  dateSubmitted: string;
  isAnonymous: boolean;
  submitter: User;
  rejectionReason?: string;
  photos: string[];
  latitude: number;
  longitude: number;
}
// Placeholder for category display
const getCategoryLabel = (category: string) => category.replace(/_/g, " ");
// --- END PLACEHOLDERS ---

interface ReportDetailsDialogProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailsDialog({
  report,
  onClose,
}: ReportDetailsDialogProps) {
  const status = report.status;

  // Helper function to get the correct badge style
  const getStatusBadge = () => {
    let className = "text-xs px-2 py-1";

    switch (status) {
      case STATUS.RESOLVED:
        className += " bg-green-600 hover:bg-green-600/80 text-white";
        break;
      case STATUS.REJECTED:
        className += " bg-red-600 hover:bg-red-600/80 text-white";
        break;
      case STATUS.PENDING:
        className += " bg-yellow-500 hover:bg-yellow-500/80 text-black";
        break;
      default: // IN_PROGRESS
        className += " bg-blue-500 hover:bg-blue-500/80 text-white";
        break;
    }
    return <Badge className={className}>{status.replace("_", " ")}</Badge>;
  };

  // --- Action Handlers ---
  const handleApprove = () => {
    alert(
      `Report ${report.id} approved! (Status would change to 'IN_PROGRESS' or 'ASSIGNED')`
    );
    onClose();
  };

  const handleReject = () => {
    const reason = prompt(
      `Why are you rejecting report ${report.id}? (This is mandatory)`
    );
    if (reason) {
      alert(`Report ${report.id} rejected! Reason: ${reason}`);
      onClose();
    } else {
      alert("Rejection cancelled (reason is mandatory).");
    }
  };

  const canModerate = status === STATUS.PENDING;

  return (
    // Dialog Overlay
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Stop click from closing dialog
      >
        {/* Dialog Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{report.title}</h1>
              <div className="mt-2">{getStatusBadge()}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0 p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-6 md:col-span-2">
              <Card className="shadow-none border-none">
                <CardHeader className="p-0 pb-3">
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">{report.description}</p>
                  {report.rejectionReason && (
                    <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                      <h4 className="font-semibold text-destructive">
                        Rejection Reason
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {report.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              <Card className="shadow-none border-none">
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Photos</CardTitle>
                  </div>
                  <CardDescription>
                    {report.photos.length} photo(s) attached.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-wrap gap-4">
                  {report.photos.map((photoUrl, index) => (
                    // Placeholder box for image preview
                    <div
                      key={index}
                      className="h-40 w-40 rounded-md border object-cover bg-muted flex items-center justify-center text-muted-foreground"
                    >
                      {/* In a real app, this would be an actual image tag */}
                      <FileText className="h-8 w-8" />
                    </div>
                  ))}
                  {report.photos.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No photos were attached to this report.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Details and Actions */}
            <div className="flex flex-col gap-6 md:col-span-1">
              {canModerate && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Moderation Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button
                      onClick={handleApprove}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      Approve (Assign)
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      className="w-full"
                    >
                      Reject
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Report Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Submitter</h4>
                    {report.isAnonymous ? (
                      <p className="text-muted-foreground">Anonymous</p>
                    ) : (
                      <>
                        <p className="text-muted-foreground">
                          {report.submitter.firstName}{" "}
                          {report.submitter.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.submitter.email}
                        </p>
                      </>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold">Category</h4>
                    <p className="text-muted-foreground">
                      {getCategoryLabel(report.category)}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold">Date Submitted</h4>
                    <p className="text-muted-foreground">
                      {new Date(report.dateSubmitted).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Lat: {report.latitude}, Lng: {report.longitude}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
