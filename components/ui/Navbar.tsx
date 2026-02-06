"use client";

import Link from "next/link";
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
import { navigationItems } from "@/lib/constants/navigation-items";
import { CookieProvider } from "../cookie-provider";
import { LanguageToggle } from "./LanguageToggle";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
  const isMobile = useIsMobile();

  return (
    <CookieProvider>
      <NavigationMenu
        viewport={isMobile}
        className="flex justify-between items-center w-full max-w-7xl sticky top-0 z-999"
      >
        <NavigationMenuList className="flex-wrap flex-1 relative">
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/">
                <h4>HOME</h4>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden md:block">
            <NavigationMenuTrigger>
              <h4>DOCS</h4>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex gap-1 flex-1 min-w-7xl absolute top-0 left-0">
              {navigationItems.map((item) => (
                <NavigationMenuLink asChild key={item.title} className="flex-1">
                  <Link
                    href="/"
                    className="group/item flex-row flex-1 items-center gap-3 text-nowrap py-20 justify-center"
                  >
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />
                    <h4>{item.title}</h4>
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />{" "}
                  </Link>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden md:block">
            <NavigationMenuTrigger>
              <h4>TESTS</h4>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex gap-1 flex-1 min-w-7xl absolute top-0 left-0">
              {navigationItems.map((item) => (
                <NavigationMenuLink asChild key={item.title} className="flex-1">
                  <Link
                    href="/"
                    className="group/item flex-row flex-1 items-center gap-3 text-nowrap py-20 justify-center"
                  >
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />
                    <h4>{item.title}</h4>
                    <div className="w-px h-4 group-hover/item:bg-primary bg-transparent transition-colors duration-300" />{" "}
                  </Link>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-px">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </NavigationMenu>
    </CookieProvider>
  );
}
