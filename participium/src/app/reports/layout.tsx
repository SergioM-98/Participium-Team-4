import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "CITIZEN" && session.user?.role !== "MUNICIPALITY_OFFICER")) {
    redirect("/forbidden");
  }

  return <>{children}</>;
}
