import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const dummyUser = {
    username: session.user?.name || "mario.rossi",
    firstName: session.user?.firstName || "Mario",
    lastName: session.user?.lastName || "Rossi",
    email: "mario.rossi@example.com",
    telegram: "mariorossi_official",
    image: "/uploads/mock_user.jpg", 
    notifications: {
      emailEnabled: true,
      telegramEnabled: false
    }
  };
  console.log("Session User:", session.user);

  return (
    <ProfilePage user={dummyUser} />
  );
}