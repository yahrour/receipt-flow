import { LogIn, UserCircle, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

export default function Account() {
  return (
    <div className="space-y-4">
      <h1>Account</h1>
      <Header />
      <SignMethods />
    </div>
  );
}
function Header() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const session = data?.data?.user;

  if (!session) {
    return (
      <div className="bg-white border flex items-center gap-4 p-4 rounded-2xl">
        <div className="bg-gray-100 p-4 rounded-full">
          <UserCircle size={24} className="text-gray-400 stroke-2" />
        </div>
        <div>
          <p className="text-sm font-medium">Not signed in</p>
          <p className="text-xs text-gray-500">Sign in to sync your receipts</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border">
      {session?.image ? (
        <img src={session.image} alt="profile" />
      ) : (
        <UserCircle />
      )}
      <div>
        <p>{session.name}</p>
        <p>{session.email}</p>
      </div>
    </div>
  );
}

function SignMethods() {
  return (
    <div className="w-full flex justify-between items-center gap-4">
      <Link to={"/signIn"} className="flex-1">
        <Button className="py-5 cursor-pointer w-full">
          <LogIn />
          Sign In
        </Button>
      </Link>
      <Link to={"/signUp"} className="flex-1">
        <Button className="py-5 cursor-pointer w-full" variant="outline">
          <UserPlus />
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
