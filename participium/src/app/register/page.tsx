import RegisterForm from "@/components/RegisterForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role.includes("CITIZEN") === false) {
      redirect("/reports");
    } else if (
      session.user.role.includes("TECHNICAL_OFFICER") === false ||
      session.user.role.includes("PUBLIC_RELATIONS_OFFICER") === false
    ) {
      redirect("/officer/reports");
    } else {
      redirect("/admin/officers/registration");
    }
  }
  return <RegisterForm />;
}
