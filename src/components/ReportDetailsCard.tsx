"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Tag, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define the shape of a Report object for display
// NOTE: These interfaces are necessary for the component to function,
// but the data will be mocked or passed in when you test it.
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "resolved";
  latitude: number;
  longitude: number;
  reporterName: string; // Could be 'Anonymous'
  createdAt: string; // ISO date string
  photoUrls: string[]; // URLs of the uploaded images
}

interface ReportDetailsCardProps {
  report: Report;
  // Function to handle a back/close action
  onClose?: () => void;
}

// Function to format the category string (e.g., 'WATER_SUPPLY' -> 'Water Supply')
const formatCategory = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function for status badge styling
const getStatusBadge = (status: Report["status"]) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-500 hover:bg-green-500/90">Approved</Badge>
      );
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-500/90">Rejected</Badge>;
    case "resolved":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500/90">Resolved</Badge>
      );
    case "pending":
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

export default function ReportDetailsCard({
  report,
  onClose,
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
              {/* Report Title */}
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
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
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
                      // NOTE: Replace 'src' with your actual image host URL when integrating
                      src={url}
                      alt={`Report Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* === Footer Section (Back/Close Button) === */}
        {onClose && (
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
