import {
  ChevronRight,
  LogIn,
  ShieldCogCorner,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

type UserSession =
  | {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null | undefined;
    }
  | undefined;
export default function Account() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const session = data?.data?.user;

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-medium">Account</h1>
      <div className="space-y-4">
        <Header session={session} />
        <SignMethods session={session} />
        <Security />
      </div>
    </div>
  );
}

function Header({ session }: { session: UserSession }) {
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

function SignMethods({ session }: { session: UserSession }) {
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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleSignOut}
      >
        <LogIn />
        Sign Out
      </Button>
    </div>
  );
}

function Security() {
  return (
    <Link
      to={"/account/security"}
      className="bg-white hover:bg-white/50 transition group flex items-center gap-4 p-4 rounded-2xl"
    >
      <div className="bg-gray-100 p-2 rounded-full">
        <ShieldCogCorner size={18} className="text-gray-400 stroke-2" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Security</p>
        <p className="text-xs text-gray-500">Password, email & sessions</p>
      </div>
      <ChevronRight
        className="text-gray-400 ml-auto group-hover:translate-x-1 transition-all"
        size={18}
      />
    </Link>
  );
}
