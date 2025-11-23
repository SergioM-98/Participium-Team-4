"use client";

import { useState } from "react";
import { X, MapPin, Image, FileText, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { approveReport, rejectReport } from "@/controllers/report.controller";

// Type imports from all-reports-list
import type { Report, ReportStatus, User } from "./all-reports-list";
import { STATUS } from "./all-reports-list";

interface ReportDetailsDialogProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailsDialog({
  report,
  onClose,
}: ReportDetailsDialogProps) {
  const status = report.status;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    report.category
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

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
  const handleApprove = async () => {
    if (!selectedDepartment) {
      alert("Please select a department to assign this report to");
      return;
    }

    setIsLoading(true);
    try {
      const response = await approveReport(
        Number(report.id),
        selectedDepartment
      );

      if (response.success) {
        alert(
          `Report approved and assigned to ${selectedDepartment} successfully!`
        );
        onClose();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsLoading(true);
    try {
      const response = await rejectReport(Number(report.id), rejectionReason);

      if (response.success) {
        alert(`Report rejected successfully!`);
        onClose();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
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
                  <CardContent className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Category
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WATER_SUPPLY">
                            Water Supply
                          </SelectItem>
                          <SelectItem value="ARCHITECTURAL_BARRIERS">
                            Architectural Barriers
                          </SelectItem>
                          <SelectItem value="SEWER_SYSTEM">
                            Sewer System
                          </SelectItem>
                          <SelectItem value="PUBLIC_LIGHTING">
                            Public Lighting
                          </SelectItem>
                          <SelectItem value="WASTE">Waste</SelectItem>
                          <SelectItem value="ROADS_SIGNS_AND_TRAFFIC_LIGHTS">
                            Roads, Signs & Traffic Lights
                          </SelectItem>
                          <SelectItem value="ROADS_AND_URBAN_FURNISHINGS">
                            Roads & Urban Furnishings
                          </SelectItem>
                          <SelectItem value="PUBLIC_GREEN_AREAS_AND_BACKGROUNDS">
                            Public Green Areas
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Department
                      </label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a department..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEPARTMENT_OF_COMMERCE">
                            Department of Commerce
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_EDUCATIONAL_SERVICES">
                            Department of Educational Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES">
                            Department of Decentralization & Civic Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES">
                            Department of Social Health & Housing
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_INTERNAL_SERVICES">
                            Department of Internal Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION">
                            Department of Culture, Sport & Tourism
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_FINANCIAL_RESOURCES">
                            Department of Financial Resources
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES">
                            Department of General Services & Procurement
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES">
                            Department of Maintenance & Technical Services
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING">
                            Department of Urban Planning & Building
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY">
                            Department of Environment, Projects & Mobility
                          </SelectItem>
                          <SelectItem value="DEPARTMENT_OF_LOCAL_POLICE">
                            Department of Local Police
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleApprove}
                      disabled={isLoading || !selectedDepartment}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Approve (Assign)"
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Reject
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Dialog */}
              {showRejectDialog && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Reject Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-24"
                      disabled={isLoading}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReject}
                        disabled={isLoading || !rejectionReason.trim()}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          "Confirm Rejection"
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectDialog(false);
                          setRejectionReason("");
                        }}
                        variant="outline"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
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
