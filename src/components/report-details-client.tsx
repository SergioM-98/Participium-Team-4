"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

import { Report, ReportStatus, STATUS } from "@/lib/reports-data";

interface ReportDetailsClientProps {
  report: Report;
}

export function ReportDetailsClient({ report }: ReportDetailsClientProps) {
  const router = useRouter();
  const status = report.status;

  // Helper function to get the correct badge
  const getStatusBadge = () => {
    let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
    let className = "";

    switch (status) {
      case STATUS.RESOLVED:
        badgeVariant = "default";
        className = "bg-green-600 hover:bg-green-600/80";
        break;
      case STATUS.REJECTED:
        badgeVariant = "destructive";
        break;
      case STATUS.PENDING:
        badgeVariant = "default";
        className = "bg-yellow-500 hover:bg-yellow-500/80 text-black";
        break;
      default:
        badgeVariant = "secondary";
        className = "bg-blue-500 hover:bg-blue-500/80 text-white";
    }
    return (
      <Badge variant={badgeVariant} className={className}>
        {status}
      </Badge>
    );
  };

  // --- Action Handlers ---
  const handleApprove = () => {
    alert(`Report ${report.id} approved! (Status would change to 'Assigned')`);
    router.push("/dashboard/reports");
  };

  const handleReject = () => {
    const reason = prompt(
      `Why are you rejecting report ${report.id}? (This is mandatory)`
    );
    if (reason) {
      alert(`Report ${report.id} rejected! Reason: ${reason}`);
      router.push("/dashboard/reports");
    } else {
      alert("Rejection cancelled (reason is mandatory).");
    }
  };

  const canModerate = status === STATUS.PENDING;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">{report.title}</h1>
        {getStatusBadge()}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard/reports")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all reports
      </Button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{report.description}</p>
              {status === STATUS.REJECTED && report.rejectionReason && (
                <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <h4 className="font-semibold text-destructive">
                    Rejection Reason
                  </h4>
                  <p className="text-muted-foreground">
                    {report.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                {report.photos.length} photo(s) attached.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {report.photos.map((photoUrl, index) => (
                <img
                  key={index}
                  src={photoUrl}
                  alt={`Report photo ${index + 1}`}
                  className="h-40 w-40 rounded-md border object-cover"
                />
              ))}
              {report.photos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No photos were attached to this report.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 md:col-span-1">
          {canModerate && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Submitter</h4>
                {report.isAnonymous ? (
                  <p className="text-muted-foreground">Anonymous</p>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      {report.submitter.firstName} {report.submitter.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.submitter.email} ({report.submitter.username})
                    </p>
                  </>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Category</h4>
                <p className="text-muted-foreground">{report.category}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Date Submitted</h4>
                <p className="text-muted-foreground">
                  {new Date(report.dateSubmitted).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Location (Lat, Lng)</h4>
                <p className="text-xs text-muted-foreground">
                  {report.latitude}, {report.longitude}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
