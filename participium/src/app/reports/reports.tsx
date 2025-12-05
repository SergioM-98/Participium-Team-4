
"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react"; 

import FileUpload01 from "@/components/file-upload-01";
import ClusterReportsSheet from "@/components/ClusterReportsSheet"; 
import ReportDetailsCard from "@/components/ReportDetailsCard"; 


import { getReportsForMap, getReportById } from "../lib/controllers/reportMap.controller"; 
import { Report, Bounds } from "../lib/dtos/map.dto"; 

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

interface ReportsProps {
  userId: string | null;
}

export default function Reports({ userId }: ReportsProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReports, setMapReports] = useState<Report[]>([]); 
  const [showMyReportsOnly, setShowMyReportsOnly] = useState(false);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Filter reports based on user selection
  const filteredReports = useMemo(() => {
    if (!showMyReportsOnly || !userId) {
      return mapReports;
    }
    return mapReports.filter(report =>{ 
      return report.citizenId === userId});
  }, [mapReports, showMyReportsOnly, userId]);

  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await getReportsForMap();
        if (result.success && result.data) {
            setMapReports(result.data); 
        }
      } catch (error) {
        console.error("Failed to load map reports:", error);
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
                        status: response.data.status?.toLowerCase() || 'pending',
                        latitude: response.data.latitude,
                        longitude: response.data.longitude,
                        reporterName: response.data.username || 'Anonymous',
                        createdAt: response.data.createdAt,
                        photoUrls: response.data.photos || [],
                        citizenId: response.data.citizenId,
                        officerId: response.data.officerId
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

  const handleReportClick = useCallback((report: Report) => {
    setSelectedReportId(report.id);
    if (isClusterSheetOpen) {
        setIsClusterSheetOpen(false);
    }
  }, [isClusterSheetOpen]);

  const handleClusterClick = useCallback(async (bounds: Bounds) => {
    setIsClusterSheetOpen(true);
    setIsLoadingReports(true);
    setClusteredReports([]); 
    setSelectedReportId(null);

    try {
        const filtered = filteredReports.filter((r) => 
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
  }, [filteredReports]);

  const handleCloseDetails = () => {
      setSelectedReportId(null);
      setFullReportData(null);
  };

  const reportsLayerProps = {
    reports: filteredReports,
    onReportClick: handleReportClick,
    onClusterClick: handleClusterClick, 
  };

  return (
    <main className="flex flex-col w-full min-h-screen md:h-screen relative md:overflow-hidden">
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Report a Location</h1>
        <p className="text-center max-w-3xl text-sm md:text-base">Click on the map to select a location.</p>
        
        {userId && (
          <div className="flex items-center gap-3 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700">All Reports</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showMyReportsOnly}
                onChange={(e) => setShowMyReportsOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">My Reports</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 w-full min-h-0 justify-center px-4 md:px-6 lg:px-8 pb-4">
        <div className="flex flex-col md:flex-row gap-3 flex-1 w-full max-w-[1920px] md:max-h-[700px] min-h-0">
          
          <div className="flex-1 md:flex-[2] flex items-stretch justify-center h-[500px] md:h-full p-2 md:p-3">
            <div className="w-full h-full relative">
              <LeafletMap 
                onLocationSelect={setSelectedLocation} 
                reportsLayer={reportsLayerProps}
              />
            </div>
          </div>
          
          <div className="flex-1 flex items-start justify-center min-h-0 p-2 md:p-3 overflow-y-auto">
            <FileUpload01 location={selectedLocation} />
          </div>
        </div>
      </div>
      

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
                     <div className="flex h-64 w-full items-center justify-center bg-background rounded-xl border border-border">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                     </div>
                )}
                {!isLoadingDetails && fullReportData && (
                    <ReportDetailsCard 
                        report={fullReportData} 
                        onClose={handleCloseDetails} 
                        showChat={true}
                    />
                )}
                {!isLoadingDetails && !fullReportData && (
                     <div className="flex h-64 items-center justify-center p-6 flex-col gap-4 bg-background rounded-xl border border-border">
                        <p className="text-muted-foreground">Impossible to load details.</p>
                        <button onClick={handleCloseDetails} className="text-sm underline">Close</button>
                     </div>
                )}
            </div>
        </div>
      )}
    </main>
  );
}