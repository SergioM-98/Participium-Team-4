"use client";

import { Menu } from "lucide-react";
import { useNavbarMenu } from "@/app/lib/hooks/useNavbarMenu";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProfileButton } from "./ProfileButton";
// Import the new component
import { NotificationBell } from "@/components/NotificationBell";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
    logout: {
      title: string;
      url: string;
    };
  };
  variant?: "homepage" | "default";
}

function Navbar1({
  logo = {
    url: "/",
    src: "/logo/participium_white.svg",
    alt: "Participium",
    title: "Participium",
  },
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
    logout: { title: "Logout", url: "/api/auth/signout?callbackUrl=/" },
  },
  variant = "default",
}: Navbar1Props) {
  const { menu: filteredMenu, logoUrl, role, username } = useNavbarMenu();

  const isHomepage = variant === "homepage";
  const navbarClasses = isHomepage
    ? "py-4 absolute top-0 left-0 w-full z-20 backdrop-blur-md bg-transparent"
    : "py-4 w-full z-20 bg-white border-b sticky top-0";

  return (
    <section className={navbarClasses}>
      <div className="w-full px-4 lg:px-8">
        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center w-full">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* --- LOGO (DESKTOP) --- */}
            <Link href={logoUrl} className="flex items-center gap-2 shrink-0">
              {/* 1. The Image */}
              <img
                src={isHomepage ? "/logo/participium_white.svg" : "/logo/participium.svg"}
                alt={logo.alt}
                className="h-8 w-auto object-contain"
              />
              {/* 2. The Text */}
              <span className={`text-lg font-semibold tracking-tighter ${isHomepage ? "text-white" : "text-black"}`}>
                {logo.title}
              </span>
            </Link>

            <div className="flex items-center min-w-0">
              <NavigationMenu>
                <NavigationMenuList>
                  {filteredMenu.map((item) => renderMenuItem(item, isHomepage))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 items-center">
            {!role ? (
              <>
                <Button asChild variant="ghost" size="sm" className={`${isHomepage ? "text-white" : "text-black"} !hover:bg-transparent !hover:text-inherit`}>
                  <a href={auth.login.url}>{auth.login.title}</a>
                </Button>
                <Button asChild variant="ghost" size="sm" className={`${isHomepage ? "text-white" : "text-black"} !hover:bg-transparent !hover:text-inherit`}>
                  <a href={auth.signup.url}>{auth.signup.title}</a>
                </Button>
              </>
            ) : (
              <>
                {role === "CITIZEN" && (
                  <NotificationBell className={isHomepage ? "text-white" : "text-black"} />
                )}

                <LogoutButton variant="ghost" size="sm" className={`${isHomepage ? "text-white" : "text-black"} !hover:bg-transparent !hover:text-inherit`} />
                <ProfileButton
                  variant="ghost"
                  size="sm"
                  showName={true}
                  username={username}
                  className={`${isHomepage ? "text-white" : "text-black"} !hover:bg-transparent !hover:text-inherit`}
                />
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`block lg:hidden ${isHomepage ? "bg-transparent backdrop-blur-md" : "bg-white border-b"} sticky top-0`}>
          <div className="flex items-center justify-between">
            {/* --- LOGO (MOBILE TOP BAR) --- */}
            <Link href={logoUrl} className="flex items-center gap-2">
              <img
                src={isHomepage ? "/logo/participium_white.svg" : "/logo/participium.svg"}
                className="h-8 w-auto object-contain opacity-80"
                alt={logo.alt}
              />
              <span className={`text-lg font-semibold tracking-tighter ${isHomepage ? "text-white" : "text-black"}`}>
                {logo.title}
              </span>
            </Link>

            {/* Right side group: Notification + Menu Trigger */}
            <div className="flex items-center gap-3">
              {/* --- NOTIFICATION BELL (MOBILE) - Only for CITIZEN --- */}
              {role === "CITIZEN" && (
                <NotificationBell className={isHomepage ? "text-white" : undefined} />
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-transparent hover:bg-transparent focus:bg-transparent border-0 shadow-none"
                  >
                    <Menu className="size-4 text-white" />
                  </Button>
                </SheetTrigger>

                <SheetContent className="overflow-y-auto z-[9999]">
                  <SheetHeader>
                    <SheetTitle>
                      {/* --- LOGO (INSIDE MOBILE MENU) --- */}
                      <Link href={logoUrl} className="flex items-center gap-2">
                        <img
                          src="/logo/participium.svg"
                          className="h-8 w-auto object-contain"
                          alt={logo.alt}
                        />
                        <span className="text-lg font-semibold tracking-tighter text-black">
                          {logo.title}
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-6 p-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {filteredMenu.map((item) => renderMobileMenuItem(item, isHomepage))}
                    </Accordion>

                    {/* Mobile buttons */}
                    <div className="flex flex-col gap-3">
                      {!role ? (
                        <>
                          <Button asChild variant="secondary" className="text-black">
                            <a href={auth.login.url}>{auth.login.title}</a>
                          </Button>
                          <Button asChild variant="secondary" className="text-black">
                            <a href={auth.signup.url}>{auth.signup.title}</a>
                          </Button>
                        </>
                      ) : (
                        <>
                          <LogoutButton
                            variant="secondary"
                            size="sm"
                            className="w-full text-black"
                          />
                          <ProfileButton
                            variant="secondary"
                            size="sm"
                            className="w-full text-black"
                            showName={false}
                            username={username}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const renderMenuItem = (item: MenuItem, isHomepage: boolean) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={`${isHomepage ? "text-white" : "text-black"} !hover:bg-transparent !hover:text-inherit`}
      >
        <Link href={item.url}>{item.title}</Link>
      </Button>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem, isHomepage: boolean) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </Link>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <Link
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export { Navbar1 };
