"use client";

import { useState, useRef, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Pencil, Save, X, Camera, Mail, Send, User as UserIcon, Bell, AlertCircle, Loader2, Info, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    telegram: string;
    image: string | null;
    notifications: {
      emailEnabled: boolean;
      telegramEnabled?: boolean;
    };
  }
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user.email,
    telegram: user.telegram,
    emailEnabled: user.notifications.emailEnabled,
    telegramEnabled: user.notifications.telegramEnabled ?? false,
  });


  const avatarStyle = useMemo(() => {
    const chartColors = [
      "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"
    ];
    const name = user.username || "User";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colorVar = chartColors[Math.abs(hash % chartColors.length)];
    
    return {
        backgroundColor: `oklch(${colorVar})`,
        color: "oklch(var(--primary-foreground))"
    };
  }, [user.username]);


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

 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
        console.log("SIMULAZIONE: Upload foto...", file.name);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        alert("Foto caricata (Simulazione)");
        router.refresh();
    });
  };


  const handleSave = () => {
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      try {
        console.log("SIMULAZIONE: Salvataggio...", formData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsEditing(false);
        router.refresh();
      } catch (err) { setError("Errore salvataggio."); }
    });
  };
  
  const handleCancel = () => {
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

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="w-full flex items-start justify-center p-4 md:py-10">
      <Card className="w-full max-w-3xl shadow-md bg-background rounded-xl">
        
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>
              Manage your contact information and notification preferences.
            </CardDescription>
          </div>
          
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
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
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
                        {user.firstName}
                    </span>
                 </div>
                 <div className="flex flex-col items-center sm:items-start gap-1">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Last Name
                    </Label>
                    <span className="text-lg font-semibold text-foreground leading-none">
                        {user.lastName}
                    </span>
                 </div>
              </div>
              
      
              <div className="flex flex-col items-center sm:items-start gap-2 mt-2 px-1">
                 <span className="text-muted-foreground text-sm font-medium flex items-center gap-1.5 font-mono">
                    <UserIcon className="h-3.5 w-3.5" /> @{user.username}
                 </span>
                 
                 <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit">
                    <UserCheck className="h-3 w-3" /> Citizen
                 </span>
              </div>
            </div>
          </div>

          
          <div className="grid gap-6 md:grid-cols-2">
            
            
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

            {/* Telegram Field */}
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
          </div>

          <Separator />

   
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Notification Preferences</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Email Pref */}
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

                {/* Telegram Pref */}
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