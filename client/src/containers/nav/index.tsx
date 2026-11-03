"use client";

import { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROLES } from "@shared/entities/users/roles.enum";
import {
  ClipboardEditIcon,
  ClipboardListIcon,
  FileQuestionIcon,
  LayoutDashboardIcon,
  ServerCogIcon,
  UserIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "usehooks-ts";

import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { cn, getThemeSize } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const backofficeUrl =
  process.env.NEXT_PUBLIC_BACKOFFICE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:1000/admin"
    : "/admin");

const navItems = {
  main: [
    {
      title: "Projects Overview",
      url: "/",
      icon: LayoutDashboardIcon,
      match: (pathname: string) => pathname === "/",
    },
    {
      title: "Create custom project",
      url: "/projects/new",
      icon: ClipboardEditIcon,
      match: (pathname: string) => pathname === "/projects/new",
    },
    {
      title: "My custom projects",
      url: "/my-projects",
      icon: ClipboardListIcon,
      match: (pathname: string) =>
        pathname === "/my-projects" ||
        // edit project (ex. /projects/[uuid]/edit):
        pathname.match(/^\/projects\/(?!new$)[\w-]+\/edit$/) ||
        // view project (ex. /projects/[uuid]):
        pathname.match(/^\/projects\/(?!new$)[\w-]+$/),
      isAuth: true,
    },
    {
      title: "Admin",
      url: backofficeUrl,
      icon: ServerCogIcon,
      match: (pathname: string) => pathname.startsWith("/admin"),
      isAdmin: true,
    },
  ],
  footer: [
    {
      title: "Methodology",
      url: "/methodology",
      icon: FileQuestionIcon,
      match: (pathname: string) => pathname === "/methodology",
    },
  ],
};

export default function MainNav() {
  const { open } = useSidebar();
  const { status, data } = useSession();
  const pathname = usePathname();
  const isAdmin = data?.user.role === ROLES.ADMIN;
  const { "methodology-page": methodologyPage } = FEATURE_FLAGS;
  const mainNavItems = useMemo(
    () =>
      navItems.main.filter((item) => {
        if (item.isAdmin) {
          return isAdmin;
        }
        if (item.isAuth) {
          return status === "authenticated";
        }
        return true;
      }),
    [isAdmin, status],
  );
  const footerNavItems = useMemo(() => {
    return navItems.footer.filter(() => methodologyPage);
  }, [methodologyPage]);
  const isMobile = useMediaQuery(`(max-width: ${getThemeSize("md")})`);

  return (
    <Sidebar collapsible="icon" className="py-6">
      <SidebarHeader>
        <span>
          {open || (!open && isMobile) ? (
            <Image
              src="/logo-full.avif"
              alt="Blue Carbon Cost Tool"
              width={166}
              height={56}
            />
          ) : (
            <Image
              src="/logo-small.avif"
              alt="Blue Carbon Cost Tool"
              width={60}
              height={56}
            />
          )}
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = item.match(pathname);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{
                        children: item.title,
                        hidden: open,
                      }}
                      className={cn(
                        isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: item.title,
                  hidden: open,
                }}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{
                children: status === "authenticated" ? "Profile" : "Sign in",
                hidden: open,
              }}
            >
              <Link
                href={status === "authenticated" ? "/profile" : "/auth/signin"}
              >
                <UserIcon />
                <span>
                  {status === "authenticated" ? "Profile" : "Sign in"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
