import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import WithNavbarLayout from "../(with-navbar)/layout";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session ) {
    redirect("/forbidden");
  }

  return <WithNavbarLayout>{children}</WithNavbarLayout>;
}
