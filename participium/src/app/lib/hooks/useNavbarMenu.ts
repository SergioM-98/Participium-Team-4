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
          { title: "Create Company", url: "/admin/companies/registration" },
        ];
      case "CITIZEN":
        return [{ title: "Reports", url: "/reports" }];
      case "TECHNICAL_OFFICER":
        return [{ title: "My Reports", url: "/officer/my-reports" }];
      case "PUBLIC_RELATIONS_OFFICER":
        return [{ title: "All Reports", url: "/officer/all-reports" }];
      case "EXTERNAL_MAINTAINER_WITH_ACCESS":
        return [{ title: "Reports", url: "/reports" }];
      case "EXTERNAL_MAINTAINER_WITHOUT_ACCESS":
        return [{ title: "Reports", url: "/reports" }];
      default:
        return [];
    }
  };

  const getLogoUrl = (): string => {
    return "/";
  };

  return { menu: getMenuByRole(), logoUrl: getLogoUrl(), role, username };
}
