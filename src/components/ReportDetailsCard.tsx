"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Tag, FileText, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import OfficerActionPanel from "../app/officer/all-reports/OfficerActionPanel"; // Import the panel

// Define the shape of a Report object for display
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status:
    | "pending_approval"
    | "assigned"
    | "in_progress"
    | "suspended"
    | "rejected"
    | "resolved"
    | string; // Added string to be safe with incoming data, but logic favors specific keys
  latitude: number;
  longitude: number;
  reporterName: string;
  createdAt: string;
  photoUrls: string[];
}

interface ReportDetailsCardProps {
  report: Report;
  onClose?: () => void;
  // New props for Officer Mode
  isOfficerMode?: boolean;
  onOfficerActionComplete?: () => void;
}

// Function to format the category string
const formatCategory = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getStatusBadge = (status: Report["status"]) => {
  switch (status) {
    case "pending_approval":
      return <Badge variant="secondary">Pending Approval</Badge>;
    case "assigned":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500/90">Assigned</Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-500/90">
          In Progress
        </Badge>
      );
    case "suspended":
      return (
        <Badge className="bg-gray-500 hover:bg-gray-500/90">Suspended</Badge>
      );
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-500/90">Rejected</Badge>;
    case "resolved":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500/90">Resolved</Badge>
      );
    default:
      // Fallback for unmatched statuses (e.g., if data comes in as "PENDING")
      return <Badge variant="secondary">{status.replace(/_/g, " ")}</Badge>;
  }
};

export default function ReportDetailsCard({
  report,
  onClose,
  isOfficerMode = false,
  onOfficerActionComplete,
}: ReportDetailsCardProps) {
  // Use a sensible default date for testing if the passed prop is invalid/missing
  const validDate = report.createdAt || new Date().toISOString();

  const formattedDate = new Date(validDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full flex items-start justify-center">
      <Card className="w-full bg-background rounded-lg p-0 shadow-md">
        {/* === Header Section === */}
        <CardHeader className="p-6 pb-4 border-b border-border">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-foreground max-w-[85%] truncate">
              {report.title}
            </CardTitle>
            {/* Close Button (if onClose function is provided) */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          {/* Status and Location */}
          <div className="flex items-center space-x-3 mt-2">
            {getStatusBadge(report.status)}
            <p className="text-sm text-muted-foreground flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              Loc: ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
            </p>
          </div>
        </CardHeader>

        {/* === Content Section === */}
        <CardContent className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm text-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              Date: {formattedDate}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-primary" />
              Category: {formatCategory(report.category)}
            </div>
            <div className="flex items-center col-span-2">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Reported By: {report.reporterName}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-base font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Images/Gallery Section */}
          {report.photoUrls.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3">
                Evidence Photos ({report.photoUrls.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.photoUrls.map((url, index) => (
                  <div
                    key={index}
                    className="aspect-video overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={url}
                      alt={`Report Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === OFFICER ACTIONS === */}
          {isOfficerMode && (
            <>
              <Separator className="my-6" />
              <OfficerActionPanel
                reportId={report.id}
                currentStatus={report.status}
                onActionComplete={onOfficerActionComplete}
              />
            </>
          )}
        </CardContent>

        {/* === Footer Section (Back/Close Button) === */}
        {/* Only show "Back" button if NOT in Officer Mode (officers have their own actions) 
            AND if an onClose handler was provided. */}
        {!isOfficerMode && onClose && (
          <div className="px-6 py-3 border-t border-border bg-muted rounded-b-lg flex justify-end">
            <Button
              variant="default"
              className="h-9 px-4 text-sm font-medium"
              onClick={onClose}
            >
              Back to Report Submission
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
