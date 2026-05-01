import {
  ChevronRight,
  LogIn,
  UserCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { ACCOUNT_TABS } from "@/constants";
import type { UserSession } from "@/types";

export function Account() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const session = data?.data?.user;

  return (
    <div className="space-y-8 mx-auto">
      <h1 className="text-3xl font-medium">Account</h1>
      <div className="space-y-4">
        <Header session={session} />
        {session && (
          <div className="space-y-2">
            {ACCOUNT_TABS.map((tab) => (
              <Tab
                key={tab.link}
                link={tab.link}
                title={tab.title}
                description={tab.description}
                icon={tab.icon}
              />
            ))}
          </div>
        )}
        <SignMethods session={session} />
      </div>
    </div>
  );
}

function Header({ session }: { session: UserSession | null | undefined }) {
  if (!session) {
    return (
      <div className="bg-white flex items-center gap-4 p-4 rounded-2xl">
        <div className="bg-gray-100 p-4 rounded-full">
          <UserCircle size={24} className="text-gray-400 stroke-2" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Not signed in</p>
          <p className="text-xs text-gray-500">Sign in to sync your receipts</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white flex items-center gap-4 p-4 rounded-2xl">
      {session.image ? (
        <img
          src={session.image}
          alt="profile"
          className="rounded-full size-14 stroke-2"
        />
      ) : (
        <div className="bg-gray-100 p-4 rounded-full">
          <UserCircle size={24} className="text-gray-400 stroke-2" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium">{session.name}</p>
        <p className="text-sm text-gray-500">{session.email}</p>
      </div>
    </div>
  );
}

function SignMethods({ session }: { session: UserSession | null | undefined }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void navigate("/signIn");
        },
      },
    });
  };
  if (!session) {
    return (
      <div className="w-full flex justify-between items-center gap-4">
        <Link to={"/signIn"} className="flex-1">
          <Button className="py-5 cursor-pointer w-full">
            <LogIn />
            Sign In
          </Button>
        </Link>
        <Link to={"/signUp"} className="flex-1">
          <Button
            className="bg-white border shadow-none py-5 cursor-pointer w-full"
            variant="outline"
          >
            <UserPlus />
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-between items-center gap-4">
      <Button
        className="py-5 cursor-pointer w-full"
        variant="destructive"
        onClick={() => void handleSignOut()}
      >
        <LogIn />
        Sign Out
      </Button>
    </div>
  );
}

function Tab({
  link,
  title,
  description,
  icon: Icon,
}: {
  link: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={link}
      className="bg-white hover:bg-white/50 transition group flex items-center gap-4 p-4 rounded-2xl"
    >
      <div className="bg-gray-100 p-2 rounded-full">
        <Icon size={18} className="text-gray-400 stroke-2" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight
        className="text-gray-400 ml-auto group-hover:translate-x-1 transition-all"
        size={18}
      />
    </Link>
  );
}
