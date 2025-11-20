// src/app/reports/reports.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";

import FileUpload01 from "../../components/file-upload-01";
import ClusterReportsSheet from "../../components/ClusterReportsSheet"; 
import ReportDetailSheet from "../../components/ReportDetailSheet"; 
import { getApprovedReportsForMap } from "@/app/lib/controllers/reportMap.controller"; 
import { Report, Bounds } from "@/app/lib/dtos/map.dto"; 

const LeafletMap = dynamic(() => import("../../components/LeafletMap"), {
  ssr: false,
});

// Mock Data Iniziale (opzionale, verrà sovrascritto dalla chiamata al DB)
const initialReports: Report[] = [];

export default function Reports() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const isDetailSheetOpen = useMemo(() => selectedReport !== null, [selectedReport]);

  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const handleReportClick = useCallback((report: Report) => {
    setSelectedReport(report);
    if (isClusterSheetOpen) {
        setIsClusterSheetOpen(false);
    }
  }, [isClusterSheetOpen]);

  const handleClusterClick = useCallback(async (bounds: Bounds) => {
    setIsClusterSheetOpen(true);
    setIsLoadingReports(true);
    setClusteredReports([]); 
    
    setSelectedReport(null);

    try {
        // 👇 CHIAMATA DIRETTA AL CONTROLLER
        const result = await getApprovedReportsForMap();
        
        if (result.success && result.data) {
            // Filtriamo lato client quelli che rientrano nei bounds del cluster
            // (Poiché il controller ora restituisce tutto, o in futuro potremmo passare i bounds al controller)
            const filtered = result.data.filter((r: any) => 
                r.latitude <= bounds.north &&
                r.latitude >= bounds.south &&
                r.longitude <= bounds.east &&
                r.longitude >= bounds.west
            );
            setClusteredReports(filtered);
        } else {
            console.error("Failed to fetch reports:", result.error);
        }
    } catch (error) {
        console.error("Errore nel recupero dei report dal cluster:", error);
    } finally {
        setIsLoadingReports(false);
    }
  }, []);

  const reportsLayerProps = {
    reports: initialReports, 
    onReportClick: handleReportClick,
    onClusterClick: handleClusterClick, 
  };

  return (
    <main className="flex flex-col w-full min-h-screen md:h-screen">
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Report a Location</h1>
        <p className="text-center max-w-3xl text-sm md:text-base">Click on the map to select a location. Only one marker can be placed at a time.</p>
      </div>
      <div className="flex flex-1 w-full min-h-0 justify-center px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-3 flex-1 w-full max-w-[1920px] md:max-h-[700px] min-h-0">
          
          <div className="flex-1 md:flex-[2] flex items-stretch justify-center h-[500px] md:h-full p-2 md:p-3">
            <div className="w-full h-full">
              <LeafletMap 
                onLocationSelect={setSelectedLocation} 
                reportsLayer={reportsLayerProps}
              />
            </div>
          </div>
          
          <div className="flex-1 flex items-start justify-center min-h-0 p-2 md:p-3">
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

      <ReportDetailSheet
        report={selectedReport}
        isOpen={isDetailSheetOpen}
        onOpenChange={(open) => {
            if (!open) setSelectedReport(null);
        }}
      />
    </main>
  );
}