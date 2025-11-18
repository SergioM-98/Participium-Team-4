"use client";

import { useState, useRef, useTransition, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/app/lib/utils/canvasUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Pencil, Save, X, Camera, Mail, Send, User as UserIcon, Bell, AlertCircle, Loader2, Info, UserCheck, ZoomIn, ZoomOut, Building2, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsData } from "@/app/lib/dtos/notificationPreferences.dto";

import { updateNotificationsMedia, getMe } from "@/app/lib/controllers/user.controller";
import { createUploadPhoto, getProfilePhotoUrl } from "@/app/lib/controllers/ProfilePhoto.controller";
import { getNotificationsPreferences } from "@/app/lib/controllers/notifications.controller";

// Definizione del tipo User locale per lo stato
type UserProfileData = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  telegram: string;
  role: string;
  office?: string;
  image: string | null;
  notifications: {
    emailEnabled: boolean;
    telegramEnabled?: boolean;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Stato locale per il form di modifica
  const [formData, setFormData] = useState({
    email: "",
    telegram: "",
    emailEnabled: false,
    telegramEnabled: false,
  });

  // Fetch dei dati utente
  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return;
      if (!session?.user?.username) return;

      setIsLoadingData(true);
      try {
        // 1. Recupera dati utente completi dal DB tramite controller
        const userDataResponse = await getMe(session.user.username);
        
        if ('error' in userDataResponse) {
          throw new Error(userDataResponse.error);
        }

        const userData = userDataResponse;
        
        // Valori di default
        let notifications = {
          emailEnabled: false,
          telegramEnabled: false
        };
        let imageUrl: string | null = null;
        
        // 2. Se Cittadino, recupera preferenze e foto
        if (userData.role === "CITIZEN") {
          try {
            const notifResponse = await getNotificationsPreferences();
            if (notifResponse.success) {
                notifications.emailEnabled = notifResponse.data.emailEnabled;
                notifications.telegramEnabled = notifResponse.data.telegramEnabled ?? false;
            }
            console.log("NOTIFICATIONS:", notifications);
          } catch (e) { console.warn("Failed to load notifications", e); }

          try {
            imageUrl = await getProfilePhotoUrl();
          } catch (e) {
            // Foto non trovata o errore, usa default
          }
        }

        const loadedUser: UserProfileData = {
            username: userData.username || session.user.username,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            telegram: userData.telegram || "",
            role: userData.role || session.user.role,
            office: userData.office || undefined,
            image: imageUrl,
            notifications: {
                emailEnabled: notifications.emailEnabled,
                telegramEnabled: notifications.telegramEnabled ?? false
            }
        };

        setUser(loadedUser);
        
        // Inizializza anche il form data
        setFormData({
            email: loadedUser.email,
            telegram: loadedUser.telegram,
            emailEnabled: loadedUser.notifications.emailEnabled,
            telegramEnabled: loadedUser.notifications.telegramEnabled ?? false,
        });

      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [session, status]);

  const avatarStyle = useMemo(() => {
    if (!user?.username) return {};
    const chartColors = [
      "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"
    ];
    const name = user.username;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colorVar = chartColors[Math.abs(hash % chartColors.length)];
    
    return {
        backgroundColor: `oklch(${colorVar})`,
        color: "oklch(var(--primary-foreground))"
    };
  }, [user?.username]);

  const validate = () => {
    if (!formData.email.trim()) {
      setValidationError("Email is required.");
      return false;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropModalOpen(true);
      e.target.value = ""; 
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) return;

      const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      
      setIsCropModalOpen(false);

      const data = new FormData();
      const filenameBase64 = btoa(file.name);
      const metadata = `filename ${filenameBase64}`;

      data.append('tus-resumable', '1.0.0');
      data.append('upload-length', file.size.toString());
      data.append('upload-metadata', metadata);
      data.append('file', file);

      startTransition(async () => {
          try {
            const result = await createUploadPhoto(data);
            if (result?.success) {
               window.location.reload(); 
            } else {
               setError(typeof result?.error === 'string' ? result.error : "Upload failed");
            }
          } catch (err) {
            console.error(err);
            setError("Error during upload");
          }
      });

    } catch (e) {
      console.error(e);
      setError("Error processing image");
    }
  };

  const handleSave = () => {
    if (!user || !validate()) return;
    setError(null);

    startTransition(async () => {
      try {
        const removeTelegram = user.telegram !== "" && formData.telegram === "";
        
        const notificationsData: NotificationsData = {
            emailEnabled: formData.emailEnabled,
            telegramEnabled: formData.telegramEnabled
        };

        const result = await updateNotificationsMedia(
            formData.telegram || null,
            formData.email || null,
            removeTelegram,
            notificationsData
        );

        if (result.success) {
            setIsEditing(false);
            setUser(prev => prev ? ({
                ...prev,
                email: formData.email,
                telegram: formData.telegram,
                notifications: {
                    emailEnabled: formData.emailEnabled,
                    telegramEnabled: formData.telegramEnabled
                }
            }) : null);
            router.refresh();
        } else {
            const errorMessage = typeof result.error === 'string' ? result.error : "Failed to update profile";
            setError(errorMessage);
        }

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    });
  };
  
  const handleCancel = () => {
    if (!user) return;
    setFormData({
      email: user.email,
      telegram: user.telegram,
      emailEnabled: user.notifications.emailEnabled,
      telegramEnabled: user.notifications.telegramEnabled ?? false,
    });
    setValidationError(null);
    setError(null);
    setIsEditing(false);
  };

  // Sicurezza: evita crash se i dati mancano
  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName || "";
    const last = user.lastName || "";
    if (!first && !last) return "U";
    return `${first.charAt(0) || ""}${last.charAt(0) || ""}`.toUpperCase();
  };

  if (status === "loading" || isLoadingData) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Profile not found.</p>
        </div>
      );
  }

  const canEdit = user.role === "CITIZEN";

  return (
    <div className="w-full flex items-start justify-center p-4 md:py-10">
      
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
             <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Adjust Profile Picture</h3>
                <p className="text-sm text-muted-foreground">Drag to position, use slider to zoom.</p>
             </div>
             <div className="relative w-full h-64 bg-black">
                <Cropper
                  image={imageSrc || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
             </div>
             <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <ZoomOut className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleUploadCroppedImage}>Save & Upload</Button>
                </div>
             </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-3xl shadow-md bg-background rounded-xl">
        
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>
              {user.role === 'OFFICER' 
                ? 'View your officer details and office assignment.' 
                : user.role === 'ADMIN'
                ? 'System administrator profile.'
                : 'Manage your contact information and notification preferences.'}
            </CardDescription>
          </div>
          
          {canEdit && (
            <Button
              variant={isEditing ? "ghost" : "outline"}
              size="sm"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              disabled={isPending}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" /> Edit
                </>
              )}
            </Button>
          )}
        </CardHeader>
        
        <Separator />

        <CardContent className="space-y-8 pt-6">
            
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
                <AvatarImage src={user.image || ""} alt={user.username} className="object-cover" />
                <AvatarFallback 
                    className="text-2xl font-bold"
                    style={avatarStyle}
                >
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-white" />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1 pt-2 w-full">
              <div className="grid grid-cols-2 gap-8 mb-3 px-1">
                 <div className="flex flex-col items-center sm:items-start gap-1">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        First Name
                    </Label>
                    <span className="text-lg font-semibold text-foreground leading-none">
                        {user.firstName || "-"}
                    </span>
                 </div>
                 <div className="flex flex-col items-center sm:items-start gap-1">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Last Name
                    </Label>
                    <span className="text-lg font-semibold text-foreground leading-none">
                        {user.lastName || "-"}
                    </span>
                 </div>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2 mt-2 px-1">
                 <span className="text-muted-foreground text-sm font-medium flex items-center gap-1.5 font-mono">
                    <UserIcon className="h-3.5 w-3.5" /> @{user.username}
                 </span>
                 <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit",
                    user.role === 'OFFICER' 
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : user.role === 'ADMIN'
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-secondary text-secondary-foreground"
                 )}>
                    {user.role === 'OFFICER' ? <ShieldAlert className="h-3 w-3" /> : user.role === 'ADMIN' ? <ShieldCheck className="h-3 w-3"/> : <UserCheck className="h-3 w-3" />} 
                    {user.role === 'OFFICER' ? 'Officer' : user.role === 'ADMIN' ? 'Administrator' : 'Citizen'}
                 </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {user.role === 'CITIZEN' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className={cn("flex items-center gap-2", isEditing && "text-primary")}>
                 <Mail className="h-4 w-4" /> Email Address
              </Label>
              {isEditing ? (
                <>
                    <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            if (validationError) setValidationError(null);
                        }}
                        placeholder="your@email.com"
                        disabled={isPending}
                        className={cn(validationError && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {validationError && <p className="text-xs text-red-500 font-medium animate-pulse">{validationError}</p>}
                </>
              ) : (
                <div className="flex items-center h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
                  {user.email || <span className="text-muted-foreground italic">Not provided</span>}
                </div>
              )}
            </div>
            )}

            {user.role === 'CITIZEN' && (
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="telegram" className={cn("flex items-center gap-2", isEditing && "text-primary")}>
                    <Send className="h-4 w-4" /> Telegram Username
                </Label>
                {isEditing ? (
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                    <Input 
                        id="telegram" 
                        className="pl-7"
                        value={formData.telegram}
                        onChange={(e) => {
                            const val = e.target.value.replace('@', '');
                            setFormData(prev => ({
                                ...prev, 
                                telegram: val,
                                telegramEnabled: val === "" ? false : prev.telegramEnabled
                            }));
                        }}
                        placeholder="username"
                        disabled={isPending}
                    />
                    </div>
                ) : (
                    <div className="flex items-center h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
                    {user.telegram ? (
                        <span className="text-blue-600 font-medium hover:underline cursor-pointer">@{user.telegram.replace('@', '')}</span>
                    ) : (
                        <span className="text-muted-foreground italic">No account linked</span>
                    )}
                    </div>
                )}
                </div>
            )}

            {user.role === 'OFFICER' && user.office && (
                 <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" /> Department / Office
                    </Label>
                    <div className="flex items-center h-12 w-full rounded-md border border-input bg-muted/30 px-3 text-sm font-medium text-foreground shadow-sm">
                        {user.office.replace(/_/g, ' ')}
                    </div>
                 </div>
            )}
          </div>

          {user.role === 'CITIZEN' && (
          <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Notification Preferences</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <div className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors",
                    isEditing ? "bg-card" : "bg-muted/20 opacity-80"
                )}>
                    <Checkbox 
                        id="emailNotif" 
                        checked={formData.emailEnabled}
                        disabled={!isEditing || isPending}
                        onCheckedChange={(checked) => 
                            setFormData({...formData, emailEnabled: checked as boolean})
                        }
                    />
                    <div className="space-y-1 leading-none">
                        <Label htmlFor="emailNotif" className="cursor-pointer">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground pt-1">
                            Receive updates about reports via email.
                        </p>
                    </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors",
                            isEditing ? "bg-card" : "bg-muted/20 opacity-80",
                            (!formData.telegram && isEditing) && "opacity-50 cursor-not-allowed"
                        )}>
                            <Checkbox 
                                id="telegramNotif" 
                                checked={formData.telegramEnabled}
                                disabled={!isEditing || isPending || !formData.telegram} 
                                onCheckedChange={(checked) => 
                                    setFormData({...formData, telegramEnabled: checked as boolean})
                                }
                            />
                            <div className="space-y-1 leading-none w-full">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="telegramNotif" className="cursor-pointer">Telegram Notifications</Label>
                                    {(!formData.telegram && isEditing) && <Info className="h-3 w-3 text-muted-foreground" />}
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Receive real-time updates on Telegram.
                                </p>
                            </div>
                        </div>
                    </TooltipTrigger>
                    {(!formData.telegram && isEditing) && (
                        <TooltipContent>
                          <p>Add a Telegram username to enable this option.</p>
                        </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
            </div>
          </div>
          </>
          )}

        </CardContent>

        {isEditing && (
          <CardFooter className="flex justify-end bg-muted/20 border-t border-border py-4 rounded-b-xl">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
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