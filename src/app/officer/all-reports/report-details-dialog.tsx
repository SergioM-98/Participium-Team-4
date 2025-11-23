"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ReportDetailsCard from "@/components/ReportDetailsCard";
import type { Report } from "./all-reports-list";
import { getReportById } from "@/app/lib/controllers/reportMap.controller";

interface ReportDetailsDialogProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailsDialog({
  report,
  onClose,
}: ReportDetailsDialogProps) {
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        // Force ID to string to match controller expectations
        const response = await getReportById({ id: String(report.id) });

        if (!isMounted) return;

        if (response.success && response.data) {
          setFullReportData({
            id: response.data.id,
            title: response.data.title,
            description: response.data.description,
            category: response.data.category,
            status: response.data.status?.toLowerCase() || "pending",
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            reporterName: response.data.username || "Anonymous",
            createdAt: response.data.createdAt,
            photoUrls: response.data.photos || [],
            photos: response.data.photos || [],
          });
        } else {
          const message =
            response.error || "Report not found (ID mismatch or deleted)";
          setErrorMsg(message);
        }
      } catch (err) {
        console.error("Crash loading details:", err);
        if (isMounted) setErrorMsg("System error loading report.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (report.id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [report.id]);

  return (
    <div
      // Styling matched from Reports.tsx (Z-index 9999, duration-300)
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        // Container styling matched from Reports.tsx (max-w-3xl, zoom-in-95)
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          // Loading state matched: bg-background, rounded border
          <div className="flex h-64 w-full items-center justify-center bg-background rounded-xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && fullReportData && (
          <ReportDetailsCard
            // @ts-ignore
            report={fullReportData}
            onClose={onClose}
            isOfficerMode={true}
            onOfficerActionComplete={() => {
              alert("Action successful!");
              onClose();
            }}
          />
        )}

        {!isLoading && !fullReportData && (
          // Error state matched: bg-background, rounded border
          <div className="flex h-64 items-center justify-center p-6 flex-col gap-4 bg-background rounded-xl border border-border">
            <p className="text-muted-foreground">
              {errorMsg || "Impossible to load details."}
            </p>
            <button onClick={onClose} className="text-sm underline">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
