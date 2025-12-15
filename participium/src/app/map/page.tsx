"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Loader2, MapPin, Info } from "lucide-react";
import ClusterReportsSheet from "@/components/ClusterReportsSheet";
import ReportDetailsCard from "@/components/ReportDetailsCard";
import { getApprovedReportsForPublic, getReportById } from "../lib/controllers/reportMap.controller";
import { Report, Bounds } from "../lib/dtos/map.dto";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

export default function MapPage() {
  const [mapReports, setMapReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        const result = await getApprovedReportsForPublic();
        if (result.success && result.data) {
          setMapReports(
            result.data.map((r: any) => ({
              ...r,
              status: r.status ?? "assigned",
            }))
          );
          console.log("Loaded approved reports:", result.data);
        } else {
          console.error("Error fetching reports:", result.error);
        }
      } catch (error) {
        console.error("Failed to load map reports:", error);
      } finally {
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      setIsLoadingDetails(true);
      setFullReportData(null);

      getReportById({ id: selectedReportId })
        .then((response) => {
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
              citizenId: response.data.citizenId,
              officerId: response.data.officerId,
              companyId: response.data.companyId,
            });
          } else {
            console.error("Error fetching report details:", response.error);
          }
        })
        .catch((err) => console.error("Failed to load details", err))
        .finally(() => setIsLoadingDetails(false));
    } else {
      setFullReportData(null);
    }
  }, [selectedReportId]);

  const handleReportClick = useCallback(
    (report: Report) => {
      setSelectedReportId(report.id);
      if (isClusterSheetOpen) {
        setIsClusterSheetOpen(false);
      }
    },
    [isClusterSheetOpen]
  );

  const handleClusterClick = useCallback(
    async (bounds: Bounds) => {
      setIsClusterSheetOpen(true);
      setClusteredReports([]);
      setSelectedReportId(null);

      try {
        const filtered = mapReports.filter(
          (r) =>
            r.latitude <= bounds.north &&
            r.latitude >= bounds.south &&
            r.longitude <= bounds.east &&
            r.longitude >= bounds.west
        );
        setClusteredReports(filtered);
      } catch (error) {
        console.error("Error in cluster:", error);
      }
    },
    [mapReports]
  );

  const handleCloseDetails = () => {
    setSelectedReportId(null);
    setFullReportData(null);
  };

  const reportsLayerProps = {
    reports: mapReports,
    onReportClick: handleReportClick,
    onClusterClick: handleClusterClick,
  };

  return (
    <main className="flex flex-col w-full h-screen relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Public Reports Map
          </h1>
        </div>
        <p className="text-center max-w-2xl text-xs sm:text-sm md:text-base text-gray-600 px-2">
          View approved reports in your area. Click on markers to see details.
        </p>

        {isLoadingReports && (
          <div className="flex items-center gap-2 mt-3 sm:mt-4 text-primary">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span className="text-xs sm:text-sm font-medium">Loading reports...</span>
          </div>
        )}

        {!isLoadingReports && mapReports.length > 0 && (
          <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
            <p className="text-xs sm:text-sm font-medium text-primary">
              <Info className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {mapReports.length} approved {mapReports.length === 1 ? "report" : "reports"} available
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-stretch justify-center px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 min-h-0">
        <div className="w-full max-w-[1920px] h-full relative rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl border border-gray-300">
          {isLoadingReports ? (
            <div className="flex h-full w-full items-center justify-center bg-white">
              <div className="text-center space-y-3 sm:space-y-4">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mx-auto" />
                <p className="text-sm sm:text-base text-gray-600 font-medium">Loading map...</p>
              </div>
            </div>
          ) : (
            <LeafletMap onLocationSelect={() => {}} reportsLayer={reportsLayerProps} />
          )}
        </div>
      </div>

      <ClusterReportsSheet
        reports={clusteredReports}
        isOpen={isClusterSheetOpen}
        onOpenChange={setIsClusterSheetOpen}
        onReportClick={handleReportClick}
        isLoading={false}
      />

      {selectedReportId && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300"
          onClick={handleCloseDetails}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl h-[90vh] sm:h-[85vh] md:h-[75vh] lg:h-[60vh] max-h-[90vh] overflow-hidden rounded-lg sm:rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoadingDetails && (
              <div className="flex h-64 w-full items-center justify-center bg-background rounded-lg sm:rounded-xl border border-border">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
              </div>
            )}
            {!isLoadingDetails && fullReportData && (
              <ReportDetailsCard
                report={fullReportData}
                onClose={handleCloseDetails}
                showChat={false}
              />
            )}
            {!isLoadingDetails && !fullReportData && (
              <div className="flex h-64 items-center justify-center p-4 sm:p-6 flex-col gap-3 sm:gap-4 bg-background rounded-lg sm:rounded-xl border border-border">
                <p className="text-sm sm:text-base text-muted-foreground">Unable to load details.</p>
                <button onClick={handleCloseDetails} className="text-xs sm:text-sm underline hover:text-primary">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
