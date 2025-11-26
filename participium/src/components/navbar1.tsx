"use client";

import { Menu } from "lucide-react";
import { useNavbarMenu } from "../app/lib/hooks/useNavbarMenu";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { LogoutButton } from "./LogoutButton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ProfileButton } from "./ProfileButton";
// Import the new component
import { NotificationBell } from "./NotificationBell";

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
}

function Navbar1({
  logo = {
    url: "/",
    src: "/logo.png", // Ensure this points to your actual image in the public folder
    alt: "Participium",
    title: "Participium",
  },
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
    logout: { title: "Logout", url: "/api/auth/signout?callbackUrl=/" },
  },
}: Navbar1Props) {
  const { menu: filteredMenu, logoUrl, role, username } = useNavbarMenu();

  return (
    <section className="py-4">
      <div className="w-full px-4 lg:px-8">
        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center w-full">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* --- LOGO (DESKTOP) --- */}
            <Link href={logoUrl} className="flex items-center gap-2 shrink-0">
              {/* 1. The Image */}
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 w-auto object-contain dark:invert"
              />
              {/* 2. The Text */}
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>

            <div className="flex items-center min-w-0">
              <NavigationMenu>
                <NavigationMenuList>
                  {filteredMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 items-center">
            {!role ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href={auth.login.url}>{auth.login.title}</a>
                </Button>
                <Button asChild size="sm">
                  <a href={auth.signup.url}>{auth.signup.title}</a>
                </Button>
              </>
            ) : (
              <>
                {role === "CITIZEN" && (
                  <div className="mr-1">
                    <NotificationBell />
                  </div>
                )}

                <LogoutButton variant="outline" size="sm" />
                <ProfileButton
                  variant="outline"
                  size="sm"
                  showName={true}
                  username={username}
                />
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* --- LOGO (MOBILE TOP BAR) --- */}
            <Link href={logoUrl} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="h-8 w-auto object-contain dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>

            {/* Right side group: Notification + Menu Trigger */}
            <div className="flex items-center gap-3">
              {/* --- NOTIFICATION BELL (MOBILE) - Only for CITIZEN --- */}
              {role === "CITIZEN" && <NotificationBell />}

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent className="overflow-y-auto z-[9999]">
                  <SheetHeader>
                    <SheetTitle>
                      {/* --- LOGO (INSIDE MOBILE MENU) --- */}
                      <Link href={logoUrl} className="flex items-center gap-2">
                        <img
                          src={logo.src}
                          className="h-8 w-auto object-contain dark:invert"
                          alt={logo.alt}
                        />
                        <span className="text-lg font-semibold tracking-tighter">
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
                      {filteredMenu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    {/* Mobile buttons */}
                    <div className="flex flex-col gap-3">
                      {!role ? (
                        <>
                          <Button asChild variant="outline">
                            <a href={auth.login.url}>{auth.login.title}</a>
                          </Button>
                          <Button asChild>
                            <a href={auth.signup.url}>{auth.signup.title}</a>
                          </Button>
                        </>
                      ) : (
                        <>
                          <LogoutButton
                            variant="outline"
                            size="sm"
                            className="w-full"
                          />
                          <ProfileButton
                            variant="outline"
                            size="sm"
                            className="w-full"
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

const renderMenuItem = (item: MenuItem) => {
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
      <NavigationMenuLink
        asChild
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        <Link href={item.url}>{item.title}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
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
