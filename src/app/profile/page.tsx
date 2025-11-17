import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";

// --- TODO: Scommentare quando il backend è pronto ---
// import { UserController } from "@/app/lib/controllers/user.controller";
// import { ProfilePhotoController } from "@/app/lib/controllers/ProfilePhoto.controller";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // --- DATI DUMMY (MOCK) PER LO SVILUPPO FRONTEND ---
  const dummyUser = {
    username: session.user?.name || "mario.rossi",
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario.rossi@example.com",
    telegram: "mariorossi_official",
    image: null, // O metti una URL stringa per testare: "https://github.com/shadcn.png"
    notifications: {
      emailEnabled: true,
      telegramEnabled: false
    }
  };

  /* --- LOGICA REALE (DA ATTIVARE IN FUTURO) ---
  
  const userController = new UserController();
  const profileData = await userController.getUserProfile(); // Assumendo che il collega crei questo metodo
  
  if (!profileData.success) return <div>Errore caricamento profilo</div>;
  const user = profileData.data;
  */

  return (
    <ProfilePage 
      user={dummyUser} 
      // user={user} // <-- In futuro userai la variabile reale
    />
  );
}