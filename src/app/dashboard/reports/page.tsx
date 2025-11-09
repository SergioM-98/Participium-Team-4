import { ReportsTable } from "@/components/reports-table";

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Reports Dashboard</h1>
      <ReportsTable />
    </div>
  );
}
