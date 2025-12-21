import LoginForm from "@/components/LoginForm";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string | string[] }> }) {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user?.role.includes("CITIZEN")) {
      redirect("/reports");
    } else if (session.user?.role.includes("ADMIN")) {
      redirect("/admin/officers/registration");
    } else if (session.user?.role.includes("TECHNICAL_OFFICER") && !session.user?.role.includes("PUBLIC_RELATIONS_OFFICER")) {
      redirect("/officer/my-reports");
    } else if (session.user?.role.includes("PUBLIC_RELATIONS_OFFICER")) {
      redirect("/officer/all-reports");
    } else {
      redirect("/");
    }
  }

  const params = await searchParams;
  const rawError = params?.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;

  return <LoginForm serverError={mapError(error)} />;
}

function mapError(err?: string | undefined) {
  if (!err) return undefined;
  const map: Record<string, string> = {
    CredentialsSignin: "Invalid credentials.",
    "The user is not verified": "User not verified. Check your email.",
    Verification: "User not verified. Check your email.",
  };
  return map[err] ?? decodeURIComponent(err) ?? err;
}
