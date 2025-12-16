"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect as useEffectHook } from "react";
import { Loader2 } from "lucide-react";
import { Navbar1 } from "@/components/navbar1";
import ClusterReportsSheet from "@/components/ClusterReportsSheet";
import ReportDetailsCard from "@/components/ReportDetailsCard";
import { getApprovedReportsForPublic, getReportById } from "../lib/controllers/reportMap.controller";
import { Report, Bounds } from "../lib/dtos/map.dto";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mapReports, setMapReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);

  // Redirect if user is logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/reports");
    }
  }, [status, session, router]);

  // Don't render anything while checking authentication
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  useEffectHook(() => {
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

  useEffectHook(() => {
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
    <>
      <Navbar1 />
      <main className="flex flex-col w-full min-h-screen md:h-screen relative md:overflow-hidden">
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          <h1 className="text-3xl font-bold mb-2 text-center">Public Reports Map</h1>
          <p className="text-center max-w-3xl text-sm md:text-base">View approved reports in your area. Click on markers to see details.</p>
        </div>
        
        <div className="flex flex-1 w-full min-h-0 justify-center px-4 md:px-6 lg:px-8 pb-4">
          <div className="w-full h-full relative max-w-[1920px]">
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
            onClick={handleCloseDetails}
        >
            <div 

                className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl h-[85vh] sm:h-[70vh] md:h-[75vh] lg:h-[60vh] max-h-[85vh] overflow-hidden rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()} 
            >
                {isLoadingDetails && (
                     <div className="flex h-64 w-full items-center justify-center bg-background rounded-xl border border-border">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
                     <div className="flex h-64 items-center justify-center p-6 flex-col gap-4 bg-background rounded-xl border border-border">
                        <p className="text-muted-foreground">Unable to load details.</p>
                        <button onClick={handleCloseDetails} className="text-sm underline">Close</button>
                     </div>
                )}
            </div>
        </div>
      )}
      </main>
    </>
  );
}
