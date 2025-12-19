"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import ClusterReportsSheet from "@/components/ClusterReportsSheet";
import ReportDetailsCard from "@/components/ReportDetailsCard";

import {
  getReportsForMap,
  getReportById,
} from "@/lib/controllers/reportMap.controller";
import { Report, Bounds } from "@/lib/dtos/map.dto";

// Dynamic Import
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
      <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
    </div>
  ),
});

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapReports, setMapReports] = useState<Report[]>([]);

  // Details Modal State
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Cluster Sheet State
  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Stable ref for filtering (optimization)
  const mapReportsRef = useRef(mapReports);
  useEffect(() => {
    mapReportsRef.current = mapReports;
  }, [mapReports]);

  // Fetch Reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await getReportsForMap();
        if (result.success && result.data) {
          setMapReports(
            result.data.map((r: any) => ({
              ...r,
              status: r.status ?? "assigned",
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load map reports:", error);
      }
    };
    fetchReports();
  }, []);

  // Fetch Details
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
          }
        })
        .catch((err) => console.error("Failed to load details", err))
        .finally(() => setIsLoadingDetails(false));
    } else {
      setFullReportData(null);
    }
  }, [selectedReportId]);

  // Handlers
  const handleReportClick = useCallback((report: Report) => {
    setSelectedReportId(report.id);
    setIsClusterSheetOpen(false);
  }, []);

  const handleClusterClick = useCallback(async (bounds: Bounds) => {
    setIsClusterSheetOpen(true);
    setIsLoadingReports(true);
    setClusteredReports([]);
    setSelectedReportId(null);

    try {
      const filtered = mapReportsRef.current.filter(
        (r) =>
          r.latitude <= bounds.north &&
          r.latitude >= bounds.south &&
          r.longitude <= bounds.east &&
          r.longitude >= bounds.west
      );
      setClusteredReports(filtered);
    } catch (error) {
      console.error("Error in cluster:", error);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

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
    // EXACT CSS CLASSES FROM reports.tsx
    <main className="flex flex-col w-full min-h-screen md:h-screen relative md:overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">City Map</h1>
        <p className="text-center max-w-3xl text-sm md:text-base">
          Explore reports and active alerts in the area.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 w-full min-h-0 justify-center px-4 md:px-6 lg:px-8 pb-4">
        {/* Removed 'gap-3' and 'md:flex-row' since there is only one child now */}
        <div className="flex flex-col flex-1 w-full max-w-[1920px] md:max-h-[700px] min-h-0">
          {/* Map Container - Taking full width now */}
          <div className="flex-1 flex items-stretch justify-center h-[500px] md:h-full p-2 md:p-3">
            <div className="w-full h-full relative">
              <LeafletMap
                onLocationSelect={setSelectedLocation}
                reportsLayer={reportsLayerProps}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <ClusterReportsSheet
        reports={clusteredReports}
        isOpen={isClusterSheetOpen}
        onOpenChange={setIsClusterSheetOpen}
        onReportClick={handleReportClick}
        isLoading={isLoadingReports}
      />

      {selectedReportId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={handleCloseDetails}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl h-[85vh] sm:h-[70vh] md:h-[75vh] lg:h-[60vh] max-h-[85vh] overflow-hidden rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoadingDetails && (
              <div className="flex h-full w-full items-center justify-center bg-background rounded-xl border border-border">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            {!isLoadingDetails && fullReportData && (
              <ReportDetailsCard
                report={fullReportData}
                onClose={handleCloseDetails}
                showChat={false} // Chat hidden for public view
              />
            )}
            {!isLoadingDetails && !fullReportData && (
              <div className="flex h-full items-center justify-center p-6 flex-col gap-4 bg-background rounded-xl border border-border">
                <p className="text-muted-foreground">
                  Impossible to load details.
                </p>
                <button
                  onClick={handleCloseDetails}
                  className="text-sm underline"
                >
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
