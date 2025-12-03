import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import WithNavbarLayout from "@/app/(with-navbar)/layout";

export default async function MaintainerLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS"
  ) {
    redirect("/forbidden");
  }

  return <WithNavbarLayout>{children}</WithNavbarLayout>;
}
