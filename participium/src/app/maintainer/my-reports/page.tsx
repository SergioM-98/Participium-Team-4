import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ReportsList from "./reports-list";

export default async function MaintainerReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS") {
    redirect("/login");
  }

  return <ReportsList maintainerId={session.user.id} />;
}
