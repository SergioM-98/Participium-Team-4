"use client";

import { useState } from "react";
import ReportDetailsCard from "../../components/ReportDetailsCard";

// --- Mock Data and Interfaces for Testing ---

// Define the necessary interfaces for the ReportDetailsCard component
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending_approval" | "assigned" | "in_progress" | "suspended" | "rejected" | "resolved";
  latitude: number;
  longitude: number;
  reporterName: string;
  createdAt: string;
  photoUrls: string[];
}

// Mock Data for the card
const mockReportData: Report = {
  id: "R12345",
  title: "Overgrown Vegetation Blocking Sidewalk",
  description:
    "The hedges belonging to the property at 123 Main St are severely overgrown and force pedestrians to walk into the street, creating a safety hazard near the school crossing.\n\nThis needs urgent attention as school starts next week.",
  category: "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
  status: "resolved",
  latitude: 40.7128,
  longitude: -74.006,
  reporterName: "Jane Smith",
  createdAt: "2025-11-19T10:30:00.000Z",
  photoUrls: [
    // Use placeholder images for testing the gallery layout
    "https://via.placeholder.com/400x225/007bff/ffffff?text=Hedge+Photo+1",
    "https://via.placeholder.com/400x225/28a745/ffffff?text=Hedge+Photo+2",
    "https://via.placeholder.com/400x225/dc3545/ffffff?text=Hedge+Photo+3",
  ],
};

// --- Test Page Component (for the /test path) ---

export default function TestPage() {
  const [report, setReport] = useState<Report>(mockReportData);

  const handleClose = () => {
    console.log(
      "Back button clicked - ReportDetailsCard should be dismissed or replaced by FileUpload01."
    );
    alert("The ReportDetailsCard's 'Back' action was triggered!");
  };

  return (
    <main className="flex flex-col w-full min-h-screen p-4">
      <div className="flex flex-1 w-full justify-center">
        {/* Mimics the width constraint of the right-hand panel so it can be replaced when clicked on the report on the map */}
        <div className="w-full max-w-lg min-h-0 p-2 md:p-3">
          <ReportDetailsCard report={report} onClose={handleClose} />
        </div>
      </div>
    </main>
  );
}
