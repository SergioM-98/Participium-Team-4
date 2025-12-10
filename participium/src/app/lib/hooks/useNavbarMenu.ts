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
    const heads: MenuItem[] = [];
    
    if (role?.includes("ADMIN")) {
      heads.push({ title: "Create Officer", url: "/admin/officers/registration" },
                { title: "Create Company", url: "/admin/companies/registration" },
                { title: "Manage Officers", url: "/admin/officers/roles"}
      );
    }
    
    if (role?.includes("CITIZEN")) {
      heads.push({ title: "Reports", url: "/reports" });
    }
    
    if (role?.includes("TECHNICAL_OFFICER")) {
      heads.push({ title: "My Reports", url: "/officer/my-reports" });
    }
    
    if (role?.includes("PUBLIC_RELATIONS_OFFICER")) {
      heads.push({ title: "All Reports", url: "/officer/all-reports" });
    }
    
    if (role?.includes("EXTERNAL_MAINTAINER_WITH_ACCESS")) {
      heads.push({ title: "My Reports", url: "/maintainer/my-reports" });
    }
    
    return heads;
  };

  const getLogoUrl = (): string => {
    return "/";
  };

  return { menu: getMenuByRole(), logoUrl: getLogoUrl(), role, username };
}
