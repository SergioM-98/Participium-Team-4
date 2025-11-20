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
        return [{ title: "Create Officer", url: "/admin/officers/registration" }];
      case "CITIZEN":
        return [
          { title: "Home", url: "/" },
          { title: "Reports", url: "/reports" }
        ];
      case "MUNICIPALITY_OFFICER":
        return [
          { title: "Home", url: "/" },
          { title: "Reports", url: "/reports" }
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
