import { Compass, MessageCircle, ListChecks, Users, UserRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  key: "find" | "coach" | "plan" | "people" | "me";
  href: string;
  icon: LucideIcon;
  /** URL prefixes that belong to this tab */
  match: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { key: "find", href: "/", icon: Compass, match: ["/find", "/explore"] },
  { key: "coach", href: "/coach", icon: MessageCircle, match: ["/coach"] },
  { key: "plan", href: "/plan", icon: ListChecks, match: ["/plan"] },
  { key: "people", href: "/people", icon: Users, match: ["/people"] },
  { key: "me", href: "/me", icon: UserRound, match: ["/me"] },
];

export function activeTab(pathname: string): NavItem["key"] | null {
  if (pathname === "/") return "find";
  for (const item of NAV_ITEMS) {
    if (item.href !== "/" && pathname.startsWith(item.href)) return item.key;
    if (item.match.some((m) => pathname.startsWith(m))) return item.key;
  }
  return null;
}
