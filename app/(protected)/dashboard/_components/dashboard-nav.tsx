"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut, useSession } from "@/lib/auth/client";
import { navigationItems } from "@/lib/constants/navigation-items";
import { CookieProvider } from "@/providers/cookie-provider";

export function DashboardNav() {
  const isMobile = useIsMobile();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <CookieProvider>
      <NavigationMenu
        viewport={isMobile}
        className="flex justify-between items-center w-full max-w-7xl sticky top-0 z-999 h-fit"
      >
        <NavigationMenuList className="flex-wrap flex-1">
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/dashboard">
                <p>HOME</p>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/dashboard/tasks">
                <p>TASKS</p>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden md:block">
            <NavigationMenuTrigger>
              <p>SAMPLE</p>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex gap-1 flex-1 min-w-7xl absolute top-0 left-0">
              {navigationItems.map((item) => (
                <NavigationMenuLink asChild key={item.title} className="flex-1">
                  <Link
                    href={item.href}
                    className="group/item flex-row flex-1 items-center gap-3 text-nowrap py-20 justify-center"
                  >
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />
                    <h6>{item.title}</h6>
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />{" "}
                  </Link>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-px">
          <LanguageToggle />
          <ModeToggle /> {/* User menu */}
          <div className="flex items-center gap-px">
            {session?.user && (
              <span className="hidden text-sm text-muted-foreground dark:text-muted-foreground sm:block">
                {session.user.name}
              </span>
            )}
            <Button variant="inverted" size="2xl" onClick={handleSignOut}>
              <LogOut className="size-4 shrink-0" />
              Sign out
            </Button>
          </div>
        </div>
      </NavigationMenu>
    </CookieProvider>
  );
}
