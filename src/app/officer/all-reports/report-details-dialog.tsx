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
      // 1. Log what we are sending to debug the ID
      console.log(
        "Fetching details for Report ID:",
        report.id,
        typeof report.id
      );

      try {
        setIsLoading(true);
        setErrorMsg(null);

        // 2. FORCE ID TO STRING to match the working Reports.tsx behavior
        // The controller likely expects a string ID.
        const response = await getReportById({ id: String(report.id) });

        if (!isMounted) return;

        // 3. Robust check: Success AND Data must exist
        if (response.success && response.data) {
          console.log("Report Details Found:", response.data);

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
          // 4. Better error handling for the "Success but no Data" case
          const message =
            response.error || "Report not found (ID mismatch or deleted)";
          console.error("Fetch failed:", message, "Full Response:", response);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : fullReportData ? (
          <ReportDetailsCard
            // @ts-ignore
            report={fullReportData}
            onClose={onClose}
            isOfficerMode={true}
            onOfficerActionComplete={() => {
              // Optional: You might want to refresh the table here
              alert("Action successful!");
              onClose();
            }}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Unable to load report details.</p>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
            )}
            <button
              onClick={onClose}
              className="block mx-auto mt-4 underline text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
