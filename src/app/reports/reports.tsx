// src/app/reports/reports.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";

import FileUpload01 from "../../components/file-upload-01";
import ClusterReportsSheet from "../../components/map/ClusterReportsSheet"; 
import ReportDetailSheet from "../../components/map/ReportDetailSheet"; // 💡 Componente Dettaglio Mock
import { getReportsInCluster } from "@/app/actions/reports"; 
import { Report, Bounds } from "@/app/lib/dtos/map.dto"; 

const LeafletMap = dynamic(() => import("../../components/LeafletMap"), {
  ssr: false,
});

// Mock Data Iniziale per popolare la mappa con i markers
const initialReports: Report[] = [
    { id: "1", title: "Buche in via Roma", latitude: 45.0686, longitude: 7.6800, category: "ROADS_AND_URBAN_FURNISHINGS" },
    { id: "2", title: "Lampione rotto in piazza Castello", latitude: 45.0700, longitude: 7.6820, category: "PUBLIC_LIGHTING" },
    { id: "3", title: "Accumulo di spazzatura", latitude: 45.0705, longitude: 7.6830, category: "WASTE" },
    { id: "4", title: "Problema idrico", latitude: 45.0701, longitude: 7.6822, category: "WATER_SUPPLY" },
    { id: "5", title: "Barriere Architettoniche", latitude: 45.09, longitude: 7.6, category: "ARCHITECTURAL_BARRIERS" },
    { id: "6", title: "Altro problema vicino", latitude: 45.07015, longitude: 7.68225, category: "OTHER" },
    { id: "7", title: "Altro problema vicino 2", latitude: 45.0702, longitude: 7.6823, category: "OTHER" },
    { id: "8", title: "Altro problema vicino 3", latitude: 45.07025, longitude: 7.68235, category: "OTHER" },
    { id: "9", title: "Lontano", latitude: 45.10, longitude: 7.75, category: "OTHER" },
];


export default function Reports() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Gestione Dettaglio Singolo Report
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const isDetailSheetOpen = useMemo(() => selectedReport !== null, [selectedReport]);

  // Gestione Cluster Report
  const [isClusterSheetOpen, setIsClusterSheetOpen] = useState(false);
  const [clusteredReports, setClusteredReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);


  // Gestisce il click su un singolo marker o un elemento della lista
  const handleReportClick = useCallback((report: Report) => {
    setSelectedReport(report);
    // Chiudi la Sheet del Cluster se è aperta
    if (isClusterSheetOpen) {
        setIsClusterSheetOpen(false);
    }
  }, [isClusterSheetOpen]);

  // Funzione chiamata al click sul cluster che invoca la Server Action
  const handleClusterClick = useCallback(async (bounds: Bounds) => {
    setIsClusterSheetOpen(true);
    setIsLoadingReports(true);
    setClusteredReports([]); 
    
    // Chiudi il dettaglio se era aperto
    setSelectedReport(null);

    try {
        const reports = await getReportsInCluster(bounds);
        setClusteredReports(reports);
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
              {/* Passaggio delle props per attivare il layer di clustering */}
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
      
      {/* Componente Sheet per la lista dei report del cluster */}
      <ClusterReportsSheet
        reports={clusteredReports}
        isOpen={isClusterSheetOpen}
        onOpenChange={setIsClusterSheetOpen}
        onReportClick={handleReportClick}
        isLoading={isLoadingReports}
      />

      {/* Componente Dettaglio Report Singolo (MOCK) */}
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