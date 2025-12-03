import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import WithNavbarLayout from "@/app/(with-navbar)/layout";

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "TECHNICAL_OFFICER" &&
      session.user.role !== "PUBLIC_RELATIONS_OFFICER")
  ) {
    redirect("/forbidden");
  }

  return <WithNavbarLayout>{children}</WithNavbarLayout>;
}
