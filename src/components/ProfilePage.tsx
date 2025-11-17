"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Save, X, Camera, User, Mail, Building, Key } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Se non hai separator, puoi usare un div border-b

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  // Stato per la modalità modifica
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Stato del form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    office: "",
    // role: "", // Il ruolo solitamente non si modifica dal profilo
  });

  // Sincronizza i dati della sessione con lo stato del form quando la sessione è pronta
  useEffect(() => {
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || "", // Assumendo che questi campi siano nel tipo User esteso
        lastName: session.user.lastName || "",
        username: session.user.username || session.user.name || "",
        email: session.user.email || "",
        office: session.user.office || "",
      });
    }
  }, [session]);

  // Helper per le iniziali
  const getInitials = () => {
    const name = session?.user?.name || session?.user?.username || "U";
    return name
      .match(/(\b\S)?/g)
      ?.join("")
      .match(/(^\S|\S$)?/g)
      ?.join("")
      .toUpperCase();
  };

  const handleCancel = () => {
    // Resetta i dati a quelli della sessione
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        username: session.user.username || session.user.name || "",
        email: session.user.email || "",
        office: session.user.office || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // --- TO ADD: CALL UPDATE USER API ---
    // Esempio: await updateUserAction(formData);
    // const response = await fetch('/api/user/update', { method: 'PUT', body: JSON.stringify(formData) });
    
    console.log("Dati da inviare al backend:", formData);
    
    // Simulo un ritardo di rete
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsEditing(false);
    // Qui dovresti ricaricare la sessione o mostrare un toast di successo
  };

  const handleAvatarUpload = () => {
    // --- TO ADD: HANDLE AVATAR UPLOAD ---
    // 1. Aprire input file nascosto
    // 2. Caricare immagine su server (es. TUS o multipart)
    // 3. Aggiornare URL avatar utente nel DB
    console.log("Trigger avatar upload logic");
    alert("Funzionalità upload avatar da implementare (TO ADD)");
  };

  if (status === "loading") {
    return <div className="flex justify-center p-10">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences.
            </CardDescription>
          </div>
          
          {/* Toggle Button */}
          <Button
            variant={isEditing ? "ghost" : "outline"}
            size="sm"
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            disabled={isLoading}
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        </CardHeader>
        
        {/* <Separator className="mb-6" /> */}
        <div className="border-b border-border mb-6" />

        <CardContent className="space-y-8">
          
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-muted">
                {/* TO ADD: Usare l'URL reale dell'immagine utente se esiste */}
                <AvatarImage src={session?.user?.image || ""} alt={formData.username} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              {/* Overlay Button for Avatar Edit */}
              {isEditing && (
                <button 
                  onClick={handleAvatarUpload}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-8 w-8" />
                </button>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="text-xl font-semibold">{session?.user?.name || formData.username}</h3>
              <p className="text-muted-foreground text-sm">{session?.user?.role}</p>
              {isEditing && (
                 <p className="text-xs text-muted-foreground mt-2">
                   Click on the picture to change your avatar.
                 </p>
              )}
            </div>
          </div>

          {/* FORM FIELDS GRID */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Username (Spesso non modificabile, o modificabile con check unicità) */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Username
              </Label>
              {isEditing ? (
                <Input 
                  id="username" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/30 rounded-md text-sm font-medium border border-transparent">
                  {formData.username}
                </div>
              )}
            </div>

            {/* Email (Solitamente Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground border border-transparent opacity-80 cursor-not-allowed">
                {formData.email || "No email provided"} (Read Only)
              </div>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
               {isEditing ? (
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/30 rounded-md text-sm border border-transparent">
                  {formData.firstName || "-"}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
               {isEditing ? (
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/30 rounded-md text-sm border border-transparent">
                  {formData.lastName || "-"}
                </div>
              )}
            </div>

            {/* Office (Solo per Officer) */}
            {session?.user?.role === "MUNICIPALITY_OFFICER" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="office" className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" /> Office
                </Label>
                 {isEditing ? (
                  // TO ADD: Qui potresti voler usare la Select di Shadcn come in MunicipalityUserForm
                   <Input 
                    id="office" 
                    value={formData.office}
                    onChange={(e) => setFormData({...formData, office: e.target.value})}
                  />
                ) : (
                  <div className="p-2 bg-muted/30 rounded-md text-sm border border-transparent">
                    {formData.office || "-"}
                  </div>
                )}
              </div>
            )}
          </div>

        </CardContent>

        {/* ACTION FOOTER (Visible only in Edit Mode) */}
        {isEditing && (
          <CardFooter className="flex justify-between bg-muted/20 border-t border-border mt-4 py-4">
             {/* TO ADD: Password Change Button/Modal Trigger */}
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => alert("TO ADD: Open Change Password Modal")}>
               <Key className="mr-2 h-4 w-4" /> Change Password
            </Button>

            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}