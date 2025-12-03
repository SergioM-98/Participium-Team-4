import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ReportsList from "./reports-list";

export default async function OfficerReportsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "TECHNICAL_OFFICER") {
    redirect("/login");
  }

  return <ReportsList officerId={session.user.id} />;
}
