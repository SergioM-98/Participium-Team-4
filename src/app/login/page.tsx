import LoginForm from "@/components/LoginForm";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {

  
  const session = await getServerSession(authOptions);


  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm/>;
}
