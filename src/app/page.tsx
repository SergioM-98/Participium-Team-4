import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import StartingPage from "@/components/homepage";
import { redirect } from "next/navigation";


export default async function HomePage(){
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/officers/registration");
  }
  
  return (
    <div className="flex items-center justify-center">
      <StartingPage role={session?.user?.role ?? ""}/>
    </div>
  );
}