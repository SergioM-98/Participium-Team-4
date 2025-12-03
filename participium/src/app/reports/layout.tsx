import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import WithNavbarLayout from "@/app/(with-navbar)/layout";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "CITIZEN" && session.user?.role !== "MUNICIPALITY_OFFICER")) {
    redirect("/forbidden");
  }

  return <WithNavbarLayout>{children}</WithNavbarLayout>;
}
