import RegisterForm from "@/components/RegisterForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role == "CITIZEN") {
      redirect("/reports");
    } else if (
      session.user.role == "TECHNICAL_OFFICER" ||
      session.user.role == "PUBLIC_RELATIONS_OFFICER"
    ) {
      redirect("/officer/reports");
    } else {
      redirect("/admin/officers/registration");
    }
  }
  return <RegisterForm />;
}
