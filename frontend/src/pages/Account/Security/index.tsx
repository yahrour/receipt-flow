import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { ManageEmail } from "./ManageEmail";
import { ManagePassword } from "./ManagePassword";
import { ManageSessions } from "./ManageSessions";
import type { SecuritySection } from "./types";

export function Security() {
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SecuritySection>(null);

  if (sessionLoading)
    return (
      <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <Spinner className="size-7" />
      </div>
    );

  if (!session?.data?.user) void navigate("/signIn", { replace: true });

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-medium">Security</h1>
      <div className="space-y-4">
        <ManageEmail
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <ManagePassword
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <ManageSessions
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
    </div>
  );
}
