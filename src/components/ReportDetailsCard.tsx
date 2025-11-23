"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Tag,
  FileText,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

import OfficerActionPanel from "../app/officer/all-reports/OfficerActionPanel";

// --- Type Definitions ---
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
    | string;
  latitude: number;
  longitude: number;
  reporterName: string;
  createdAt: string;
  // Make these optional so we can handle both data shapes safely
  photoUrls?: string[];
  photos?: string[];
}

interface ReportDetailsCardProps {
  report: Report;
  onClose?: () => void;
  isOfficerMode?: boolean;
  onOfficerActionComplete?: () => void;
}

// --- Helpers ---
const formatCategory = (category: string) => {
  if (!category) return "Uncategorized";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getStatusBadge = (status: Report["status"]) => {
  const normalizedStatus = status ? status.toLowerCase() : "unknown";
  switch (normalizedStatus) {
    case "pending_approval":
    case "pending":
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
      return (
        <Badge variant="secondary">{normalizedStatus.replace(/_/g, " ")}</Badge>
      );
  }
};

export default function ReportDetailsCard({
  report,
  onClose,
  isOfficerMode = false,
  onOfficerActionComplete,
}: ReportDetailsCardProps) {
  // FAILSAFE: robustly check for photos regardless of property name
  const evidencePhotos = report.photoUrls || report.photos || [];

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
        {/* === Header === */}
        <CardHeader className="p-6 pb-4 border-b border-border">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-foreground max-w-[85%] truncate">
              {report.title}
            </CardTitle>
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
          <div className="flex items-center space-x-3 mt-2">
            {getStatusBadge(report.status)}
            <p className="text-sm text-muted-foreground flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              Loc: ({Number(report.latitude).toFixed(4)},{" "}
              {Number(report.longitude).toFixed(4)})
            </p>
          </div>
        </CardHeader>

        {/* === Content === */}
        <CardContent className="p-6 space-y-5">
          {/* Metadata */}
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
              Reported By: {report.reporterName || "Anonymous"}
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

          {/* Photos Section */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              Evidence Photos{" "}
              <span className="text-muted-foreground font-normal">
                ({evidencePhotos.length})
              </span>
            </h3>

            {evidencePhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {evidencePhotos.map((url, index) => (
                  // Using 'relative' and 'aspect-video' ensures the box always has height
                  <div
                    key={index}
                    className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/50 group"
                  >
                    <img
                      src={url}
                      alt={`Report Photo ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add(
                          "flex",
                          "items-center",
                          "justify-center"
                        );
                      }}
                    />
                    {/* Fallback Icon (shown if image fails or while loading) */}
                    <div className="hidden group-hover:flex absolute inset-0 bg-black/40 items-center justify-center pointer-events-none">
                      {/* Optional hover effect */}
                    </div>
                    {/* Empty state placeholder behind image */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                No photos provided.
              </div>
            )}
          </div>

          {/* === OFFICER ACTIONS === */}
          {isOfficerMode && (
            <>
              <Separator className="my-6" />
              <OfficerActionPanel
                reportId={report.id}
                currentStatus={report.status}
                currentCategory={report.category}
                onActionComplete={onOfficerActionComplete}
              />
            </>
          )}
        </CardContent>

        {/* === Footer === */}
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
