import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Spinner } from "../../ui/spinner";
import { ManageEmail } from "./ManageEmail";
import { ManagePassword } from "./ManagePassword";
import { ManageSessions } from "./ManageSessions";
import { ArrowLeft } from "lucide-react";

type Panel = "email" | "password" | "session" | null;

export default function Security() {
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<Panel>(null);

  if (sessionLoading)
    return (
      <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <Spinner className="size-8" />
      </div>
    );

  if (!session?.data?.user) void navigate("/signIn", { replace: true });

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <Link
        to="/account"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-600 transition text-sm"
      >
        <ArrowLeft size={18} />
        <span>Account</span>
      </Link>
      <h1 className="text-3xl font-medium">Security</h1>
      <div className="space-y-4">
        <ManageEmail
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
        <ManagePassword
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
        <ManageSessions
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
      </div>
    </div>
  );
}

export type Props = {
  activePanel: Panel;
  setActivePanel: React.Dispatch<React.SetStateAction<Panel>>;
};
