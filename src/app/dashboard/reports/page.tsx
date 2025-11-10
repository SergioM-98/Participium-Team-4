import { getReports } from "@/lib/reports-data";
import { ReportsListClient } from "@/components/reports-list-client";

// This remains a Server Component
export default async function ReportsPage() {
  // 1. Fetch data on the server
  const reportsData = await getReports();

  return (
    // 2. Render the client component directly inside a simple div
    <div className="container mx-auto py-10">
      <ReportsListClient data={reportsData} />
    </div>
  );
}
