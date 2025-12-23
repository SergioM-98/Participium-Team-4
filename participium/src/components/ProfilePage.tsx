"use client";

import {
  useState,
  useRef,
  useTransition,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { getCroppedImg } from "@/lib/utils/canvasUtils";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Pencil,
  Save,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { NotificationsData } from "@/app/lib/dtos/notificationPreferences.dto";

import {
  updateNotificationsMedia,
  getMe,
} from "@/app/lib/controllers/user.controller";
import {
  createUploadPhoto,
  getProfilePhotoUrl,
} from "@/app/lib/controllers/ProfilePhoto.controller";
import { startTelegramRegistration } from "@/app/lib/controllers/telegramBot.controller";

// Import utilities
import {
  isCitizen as checkIsCitizen,
  isExternalMaintainer as checkIsExternalMaintainer,
  isOfficerOrAdmin,
  getCardDescription,
} from "./profile/utils/roleUtils";
import { validateEmail } from "./profile/utils/validationUtils";

// Import sub-components
import { CropModal } from "./profile/CropModal";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { EmailSection } from "./profile/EmailSection";
import { TelegramSection } from "./profile/TelegramSection";
import { OfficeSection } from "./profile/OfficeSection";
import { NotificationPreferences } from "./profile/NotificationPreferences";

type UserProfileData = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  telegram: boolean;
  pendingRequest: boolean;
  role: string[];
  office?: string[];
  companyId?: string;
  companyName?: string;
  image: string | null;
  notifications: {
    emailEnabled: boolean;
    telegramEnabled?: boolean;
  };
};

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    telegram: false,
    pendingRequest: false,
    emailEnabled: false,
    telegramEnabled: false,
  });

  const [removeTelegram, setRemoveTelegram] = useState(false);

  const [telegramStatus, setTelegramStatus] = useState<
    "idle" | "opening" | "opened"
  >("idle");

  const fetchInProgressRef = useRef(false);

  const buildUserProfile = (
    userData: any,
    imageUrl: string | null,
    notifications: any
  ): UserProfileData => {
    if (
      "username" in userData &&
      "firstName" in userData &&
      "lastName" in userData &&
      "role" in userData
    ) {
      return {
        username: userData.username || session?.user?.username || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        telegram: !!userData.telegram,
        pendingRequest: !!userData.pendingRequest,
        role: userData.role || session?.user?.role || [],
        office: userData.office || [],
        companyId: userData.companyId || undefined,
        companyName: (userData).companyName || undefined,
        image: imageUrl,
        notifications: {
          emailEnabled: notifications.emailEnabled,
          telegramEnabled: notifications.telegramEnabled ?? false,
        },
      };
    }
    return {
      username: session?.user?.username || "",
      firstName: "",
      lastName: "",
      email: "",
      telegram: false,
      pendingRequest: false,
      role: session?.user?.role || [],
      office: undefined,
      image: imageUrl,
      notifications: {
        emailEnabled: notifications.emailEnabled,
        telegramEnabled: notifications.telegramEnabled ?? false,
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return;
      if (!session?.user?.username) return;
      if (fetchInProgressRef.current) return;

      fetchInProgressRef.current = true;
      setIsLoadingData(true);
      try {
        const userDataResponse = await getMe();

        if (!("me" in userDataResponse)) {
          throw new Error(
            "error" in userDataResponse
              ? userDataResponse.error
              : "Invalid response from server"
          );
        }

        const userData = userDataResponse.me;
        const notifications = {
          emailEnabled: userDataResponse.emailNotifications || false,
          telegramEnabled: userDataResponse.telegramNotifications || false,
        };

        let imageUrl: string | null = null;
        if ("role" in userData && userData.role.includes("CITIZEN")) {
          try {
            const url = await getProfilePhotoUrl();
            imageUrl = url === undefined ? null : url;
          } catch (e) {
            console.warn("Failed to fetch profile photo", e);
          }
        }

        const loadedUser = buildUserProfile(userData, imageUrl, notifications);
        setUser(loadedUser);
        setFormData({
          email: loadedUser.email,
          telegram: loadedUser.telegram,
          pendingRequest: loadedUser.pendingRequest,
          emailEnabled: loadedUser.notifications.emailEnabled,
          telegramEnabled: loadedUser.notifications.telegramEnabled ?? false,
        });
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoadingData(false);
        fetchInProgressRef.current = false;
      }
    };

    fetchData();
  }, [session?.user?.username, status]);

  useEffect(() => {
    const handleFocus = async () => {
      if (telegramStatus === "opened" && !user?.telegram) {
        try {
          const userDataResponse = await getMe();

          if ("error" in userDataResponse || !("me" in userDataResponse)) return;

          if ("telegram" in userDataResponse.me && userDataResponse.me.telegram) {
            setUser((prev) =>
              prev ? { ...prev, telegram: !!userDataResponse.me.telegram } : null
            );
            setTelegramStatus("idle");
          }
        } catch (e) {
          console.error("Error fetching profile on focus", e);
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [telegramStatus, user?.telegram]);

  const avatarStyle = useMemo(() => {
    if (!user?.username) return {};
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    const name = user.username;
    let hash = 0;


    for (let i = 0; i < name.length; i++) {
      const encodedChar = name.codePointAt(i);
      if (encodedChar !== undefined) hash = encodedChar + ((hash << 5) - hash);
    }
    const colorVar = chartColors[Math.abs(hash % chartColors.length)];

    return {
      backgroundColor: `oklch(${colorVar})`,
      color: "oklch(var(--primary-foreground))",
    };
  }, [user?.username]);

  const validate = () => {
    const validation = validateEmail(formData.email);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleFileSelect = async (file: File) => {
    const imageDataUrl = await readFile(file);
    setImageSrc(imageDataUrl as string);
    setIsCropModalOpen(true);
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) return;

      const file = new File([croppedImageBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      setIsCropModalOpen(false);

      const data = new FormData();
      const filenameBase64 = btoa(file.name);
      const metadata = `filename ${filenameBase64}`;

      data.append("tus-resumable", "1.0.0");
      data.append("upload-length", file.size.toString());
      data.append("upload-metadata", metadata);
      data.append("file", file);

      startTransition(async () => {
        try {
          const result = await createUploadPhoto(data);
          if (result?.success) {
            // Update state instead of hard reload to avoid infinite loops
            const url = await getProfilePhotoUrl();
            setUser((prev) => prev ? { ...prev, image: url || null } : null);
          } else {
            setError(
              typeof result?.error === "string" ? result.error : "Upload failed"
            );
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

  const handleConnectTelegram = () => {
    setTelegramStatus("opening");

    startTransition(async () => {
      try {
        const result = await startTelegramRegistration();
        if (result.success) {
          const token = result.data;
          const botName = "participium_bot";

          if (!botName) {
            setError("Bot username configuration missing on client.");
            setTelegramStatus("idle");
            return;
          }

          const telegramUrl = `https://t.me/${botName}?start=${token}`;
          window.open(telegramUrl, "_blank", "noopener,noreferrer");

          setError(null);
          setTelegramStatus("opened");
        } else {
          setError(result.error || "Failed to start Telegram registration");
          setTelegramStatus("idle");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred connecting Telegram");
        setTelegramStatus("idle");
      }
    });
  };

  const handleSave = () => {
    if (!user?.role.includes("CITIZEN") || !validate()) return;
    setError(null);

    startTransition(async () => {
      try {
        const notificationsData: NotificationsData = {
          emailEnabled: formData.emailEnabled,
          telegramEnabled: formData.telegramEnabled,
        };

        const result = await updateNotificationsMedia(
          formData.email || null,
          removeTelegram,
          notificationsData
        );

        if (result.success) {
          setIsEditing(false);
          setRemoveTelegram(false);
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  email: formData.email,
                  telegram: removeTelegram ? false : Boolean(formData.telegram),
                  notifications: {
                    emailEnabled: formData.emailEnabled,
                    telegramEnabled: removeTelegram ? false : formData.telegramEnabled,
                  },
                }
              : null
          );
          if (removeTelegram) {
            setFormData({
              ...formData,
              telegram: false,
              telegramEnabled: false,
            });
          }
        } else {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : "Failed to update profile";
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
      telegram: user.telegram ?? false,
      pendingRequest: user.pendingRequest ?? false,
      emailEnabled: user.notifications.emailEnabled,
      telegramEnabled: user.notifications.telegramEnabled ?? false,
    });
    setRemoveTelegram(false);
    setValidationError(null);
    setError(null);
    setIsEditing(false);
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

  const isCitizen = checkIsCitizen(user.role);
  const isExternalMaintainer = checkIsExternalMaintainer(user.role);
  const canEdit = isCitizen;
  const isTelegramConnected = !!user.telegram;

  return (
    <div className="w-full flex items-start justify-center p-4 md:py-10">
      <CropModal
        imageSrc={imageSrc}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleUploadCroppedImage}
        isOpen={isCropModalOpen}
      />

      <Card className="w-full max-w-3xl shadow-md bg-background rounded-xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>{getCardDescription(user.role)}</CardDescription>
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
            <ProfileAvatar
              imageUrl={user.image}
              username={user.username}
              avatarStyle={avatarStyle}
              isEditing={isEditing}
              onFileSelect={handleFileSelect}
            />

            <ProfileInfo
              firstName={user.firstName}
              lastName={user.lastName}
              username={user.username}
              role={user.role}
              companyName={user.companyName}
              isExternalMaintainer={isExternalMaintainer}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isCitizen && (
              <EmailSection
                email={formData.email}
                isEditing={isEditing}
                isPending={isPending}
                validationError={validationError}
                onEmailChange={(email) =>
                  setFormData({ ...formData, email })
                }
                onValidationErrorChange={setValidationError}
              />
            )}

            {isCitizen && (
              <TelegramSection
                isTelegramConnected={isTelegramConnected}
                isEditing={isEditing}
                isPending={isPending}
                telegramStatus={telegramStatus}
                removeTelegram={removeTelegram}
                onConnectTelegram={handleConnectTelegram}
                onRemoveTelegramChange={(checked) => {
                  setRemoveTelegram(checked);
                  setFormData({
                    ...formData,
                    telegramEnabled: checked ? false : user?.notifications.telegramEnabled ?? false,
                  });
                }}
              />
            )}

            {isOfficerOrAdmin(user.role) && (
              <OfficeSection office={user.office || []} />
            )}
          </div>

          {isCitizen && (
            <NotificationPreferences
              isEditing={isEditing}
              isPending={isPending}
              emailEnabled={formData.emailEnabled}
              telegramEnabled={formData.telegramEnabled}
              isTelegramConnected={isTelegramConnected}
              onEmailEnabledChange={(checked) =>
                setFormData({ ...formData, emailEnabled: checked })
              }
              onTelegramEnabledChange={(checked) =>
                setFormData({ ...formData, telegramEnabled: checked })
              }
            />
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
