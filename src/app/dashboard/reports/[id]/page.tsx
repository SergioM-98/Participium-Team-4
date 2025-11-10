import { getReportById } from "@/lib/reports-data";
import { notFound } from "next/navigation";
import { ReportDetailsClient } from "@/components/report-details-client";

// Define the props structure with a Promise *inside*
interface ReportDetailsPageProps {
  params: Promise<{ id: string }>; // The 'params' property itself is the promise
}

// Accept the props object
export default async function ReportDetailsPage({
  params: paramsPromise, // Destructure 'params' and rename it
}: ReportDetailsPageProps) {
  // Await the 'params' property to get the resolved object
  const params = await paramsPromise;

  // Fetch the single report (this will now work)
  const report = await getReportById(params.id);

  // Handle not found case
  if (!report) {
    notFound();
  }

  // Pass the report data to the client component
  return (
    <div className="container mx-auto py-10">
      <ReportDetailsClient report={report} />
    </div>
  );
}
