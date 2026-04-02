import { Home, BarChart3, UserCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router";

const tabs = [
  { path: "/", label: "Feed", icon: Home },
  { path: "/add", label: "Add", icon: Plus },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/account", label: "Account", icon: UserCircle },
];

export function BottomTabBar() {
  const location = useLocation();
  const activePath =
    tabs.find((t) => t.path === location.pathname)?.path ?? "/";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-xl">
      <nav className="bg-white mx-3 mb-3 flex items-center justify-between rounded-xl backdrop-blur-xl border border-border/50 shadow-(--shadow-soft) px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = activePath === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              prefetch="intent"
              to={{
                pathname: tab.path,
              }}
              className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-colors flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
