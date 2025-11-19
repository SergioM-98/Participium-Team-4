// src/app/actions/reports.ts
"use server";

import { Report, Bounds, BoundsSchema } from "@/dtos/map.dto"; 

/**
 * Funzione Server Action: Recupera i report all'interno di un'area geografica (bounds).
 */
export async function getReportsInCluster(rawBounds: unknown): Promise<Report[]> {
  
  // 💡 Validazione del dato in entrata con Zod
  const validationResult = BoundsSchema.safeParse(rawBounds);
  if (!validationResult.success) {
      console.error("Invalid bounds received:", validationResult.error);
      return [];
  }
  const bounds: Bounds = validationResult.data;
  
  // --- MOCK DATA E FILTRAGGIO SIMULATO ---
  const mockReports: Report[] = [
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

  const filteredReports = mockReports.filter(report => 
    report.latitude >= bounds.south &&
    report.latitude <= bounds.north &&
    report.longitude >= bounds.west &&
    report.longitude <= bounds.east
  );

  await new Promise(resolve => setTimeout(resolve, 1500)); 

  return filteredReports;
}