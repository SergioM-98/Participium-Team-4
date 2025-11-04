import { redirect } from "next/navigation";

export default function Home() {
  // Automatically redirect to the login page
  // This makes /login the "main" page for users.
  redirect("/login");
}
