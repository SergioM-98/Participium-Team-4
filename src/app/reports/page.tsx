"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("../../components/LeafletMap"), {
  ssr: false,
});

export default function ReportsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-center">Select a location on the map</h1>
        <p className="mb-6 text-center">Click on the map to select a location. Only one marker can be placed at a time.</p>
        <LeafletMap />
      </div>
    </main>
  );
}
