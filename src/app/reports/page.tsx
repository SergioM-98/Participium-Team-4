
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Reports from "./reports";
import ToLogin from "@/components/auth/RedirectComponent";


export default async function ReportsPage() {

  const session = await getServerSession(authOptions);

  if(session?.user.role!=="CITIZEN"){
    return <ToLogin role={"citizen"}/>;
  }

  return <Reports/>;
}

