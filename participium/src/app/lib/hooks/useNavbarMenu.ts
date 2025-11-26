"use client";

import { useSession } from "next-auth/react";

interface MenuItem {
  title: string;
  url: string;
}

export function useNavbarMenu() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const username = session?.user?.username;

  const getMenuByRole = (): MenuItem[] => {
    switch (role) {
      case "ADMIN":
        return [
          { title: "Create Officer", url: "/admin/officers/registration" },
        ];
      case "CITIZEN":
        return [
          { title: "Home", url: "/" },
          { title: "Reports", url: "/reports" },
        ];
      case "TECHNICAL_OFFICER":
        return [
          { title: "Home", url: "/" },
          { title: "My Reports", url: "/officer/my-reports" },
        ];
      case "PUBLIC_RELATIONS_OFFICER":
        return [
          { title: "Home", url: "/" },
          { title: "All Reports", url: "/officer/all-reports" },
        ];
      default:
        return [{ title: "Home", url: "/" }];
    }
  };

  const getLogoUrl = (): string => {
    return "/";
  };

  return { menu: getMenuByRole(), logoUrl: getLogoUrl(), role, username };
}
