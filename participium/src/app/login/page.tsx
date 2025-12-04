import LoginForm from "@/components/LoginForm";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string | string[] } }) {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user?.role === "CITIZEN") {
      redirect("/reports");
    } else if (session.user?.role === "ADMIN") {
      redirect("/admin/officers/registration");
    } else if (session.user?.role === "TECHNICAL_OFFICER") {
      redirect("/officer/my-reports");
    } else if (session.user?.role === "PUBLIC_RELATIONS_OFFICER") {
      redirect("/officer/all-reports");
    } else {
      redirect("/");
    }
  }

  const rawError = searchParams?.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;

  return <LoginForm serverError={mapError(error)} />;
}

function mapError(err?: string | undefined) {
  if (!err) return undefined;
  const map: Record<string, string> = {
    CredentialsSignin: "Credenziali non valide.",
    "The user is not verified": "Utente non verificato. Controlla la tua email.",
    Verification: "Utente non verificato. Controlla la tua email.",
  };
  return map[err] ?? decodeURIComponent(err) ?? err;
}
