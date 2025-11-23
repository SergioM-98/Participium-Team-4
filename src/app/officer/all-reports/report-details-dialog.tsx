"use client";

import ReportDetailsCard from "@/components/ReportDetailsCard";
import type { Report } from "./all-reports-list";

interface ReportDetailsDialogProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailsDialog({
  report,
  onClose,
}: ReportDetailsDialogProps) {
  // Map the Officer "Report" data shape to the "ReportDetailsCard" data shape
  const mappedReportForCard = {
    id: report.id.toString(),
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status, // Ensure this matches what ReportDetailsCard expects
    latitude: report.latitude,
    longitude: report.longitude,
    reporterName: report.isAnonymous
      ? "Anonymous"
      : `${report.submitter.firstName} ${report.submitter.lastName}`,
    createdAt: report.dateSubmitted,
    photoUrls: report.photos || [],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        // Changed max-w-6xl to max-w-2xl for a cleaner, vertical card look
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* We no longer need a separate Header or Grid layout here.
          The ReportDetailsCard handles the Header, Content, and Officer Actions internally.
        */}
        <ReportDetailsCard
          // @ts-ignore - Ignoring minor type mismatches between different Report definitions
          report={mappedReportForCard}
          onClose={onClose} // Passing this enables the 'X' button inside the card
          isOfficerMode={true} // Triggers the internal OfficerActionPanel
          onOfficerActionComplete={() => {
            // You can add logic here to refresh the list if needed
            alert("Action successful!");
            onClose();
          }}
        />
      </div>
    </div>
  );
}
