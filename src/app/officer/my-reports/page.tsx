import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ReportsList from "./reports-list";

export default async function OfficerReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OFFICER") {
    redirect("/login");
  }

  return <ReportsList officerId={session.user.id} />;
}
