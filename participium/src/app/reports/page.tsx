import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Reports from "./reports";


export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  return <Reports userId={session?.user?.id || null} />;
}

