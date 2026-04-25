import {
  BarChart3,
  Clock,
  Home,
  Plus,
  Settings,
  ShieldCogCorner,
  UserCircle,
} from "lucide-react";

export const CURRENCIES = [
  { value: "MAD", label: "Moroccan Dirham", symbol: "DH" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
] as const;

export const ACCOUNT_TABS = [
  {
    link: "/account/security",
    title: "Security",
    description: "Password, email & sessions",
    icon: ShieldCogCorner,
  },
  {
    link: "/account/settings",
    title: "Settings",
    description: "Currency & preferences",
    icon: Settings,
  },
] as const;

export const TABS = [
  { path: "/", label: "Feed", icon: Home },
  { path: "/history", label: "History", icon: Clock },
  { path: "/add-receipt", label: "Add", icon: Plus },
  { path: "/stats", label: "Stats", icon: BarChart3 },
  { path: "/account", label: "Account", icon: UserCircle },
] as const;

export const RECEIPT_CATEGORIES = [
  "groceries",
  "restaurant",
  "transport",
  "entertainment",
  "health",
  "shopping",
  "utilities",
  "travel",
  "other",
] as const;

export const DEFAULT_CURRENCY = "USD" as const;
