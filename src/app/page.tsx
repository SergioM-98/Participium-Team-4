import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import StartingPage from "@/components/homepage";


export default async function HomePage(){
  const session = await getServerSession(authOptions);
  return (
    <div className="flex items-center justify-center">
      <StartingPage role={session?.user?.role ?? ""}/>
    </div>
  );
}