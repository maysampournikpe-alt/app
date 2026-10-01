import { Briefcase, Sparkles, School, GraduationCap, Coins, FileText, Wrench, Medal, Bus, HandCoins } from "lucide-react";

/** The Explore pages, in the order shown. */
export const EXPLORE_LINKS = [
  { href: "/explore/quiz", key: "quiz", icon: Sparkles },
  { href: "/explore/careers", key: "careers", icon: Briefcase },
  { href: "/explore/colleges", key: "colleges", icon: School },
  { href: "/explore/dual", key: "dual", icon: GraduationCap },
  { href: "/explore/scholarships", key: "scholarships", icon: Coins },
  { href: "/explore/fafsa", key: "fafsa", icon: FileText },
  { href: "/explore/trades", key: "trades", icon: Wrench },
  { href: "/explore/military", key: "military", icon: Medal },
  { href: "/explore/money", key: "money", icon: HandCoins },
  { href: "/explore/transport", key: "transport", icon: Bus },
] as const;
