import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/forbidden");
  }

  return <>{children}</>;
}
