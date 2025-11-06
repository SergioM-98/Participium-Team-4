"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import FileUpload01 from "../../components/file-upload-01";

const LeafletMap = dynamic(() => import("../../components/LeafletMap"), {
  ssr: false,
});


export default function ReportsPage() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <main className="flex flex-col w-full min-h-screen md:h-screen">
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Report a Location</h1>
        <p className="text-center max-w-3xl text-sm md:text-base">Click on the map to select a location. Only one marker can be placed at a time.</p>
      </div>
      <div className="flex flex-1 w-full min-h-0 justify-center px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-1 w-full max-w-[1920px] md:max-h-[700px] min-h-0">
          <div className="flex-1 md:flex-[2] flex items-stretch justify-center h-[500px] md:h-full p-4 md:p-6 mb-8 md:mb-0">
            <div className="w-full h-full">
              <LeafletMap onLocationSelect={setSelectedLocation} />
            </div>
          </div>
          <div className="flex-1 flex items-start justify-center min-h-0 p-4 md:p-6 overflow-y-auto">
            <FileUpload01 location={selectedLocation} />
          </div>
        </div>
      </div>
    </main>
  );
}

