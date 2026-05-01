import { Clock, MonitorSmartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { UAParser } from "ua-parser-js";
import { timeAgo } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/main";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import type { SecurityContextState } from "./types";

export function ManageSessions({
  activeSection,
  setActiveSection,
}: SecurityContextState) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["device-sessions"],
    queryFn: () => authClient.listSessions(),
  });

  if (isLoading) {
    return <Skeleton className="h-18 rounded-2xl" />;
  }

  return (
    <div>
      <div
        className={`cursor-pointer bg-white hover:bg-white/50 transition group flex items-center gap-4 p-4 ${activeSection === "session" ? "rounded-tl-2xl rounded-tr-2xl" : "rounded-2xl"}`}
        onClick={() =>
          setActiveSection(activeSection === "session" ? null : "session")
        }
      >
        <div className="bg-gray-100 p-2 rounded-full">
          <MonitorSmartphone size={18} className="text-gray-400 stroke-2" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Active sessions</p>
          <p className="text-xs text-gray-500">
            {sessions?.data?.length || 0} devices
          </p>
        </div>
      </div>
      <AnimatePresence>
        {activeSection === "session" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="w-full border-t bg-white rounded-bl-2xl rounded-br-2xl">
              {sessions?.data?.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SessionItem({ session }: { session: any }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const { browser, device } = UAParser(session.userAgent as string);

  const handleSessionRevoke = async (sessionToken: string) => {
    await authClient.revokeSession({
      token: sessionToken,
    });
    await queryClient.refetchQueries({ queryKey: ["device-sessions"] });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <MonitorSmartphone size={18} className="text-gray-400 stroke-2" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {browser.name} on {device.type || "Unknown device"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} />
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              timeAgo(session.createdAt as string)
            }
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="p-0 text-xs text-red-500 hover:bg-transparent hover:text-red-600 cursor-pointer"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        onClick={() => void handleSessionRevoke(session.token as string)}
      >
        Sign out
      </Button>
    </div>
  );
}
