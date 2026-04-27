import { Link } from "react-router";
import { Button } from "./ui/button";

export default function AuthRequired() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="max-w-sm w-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Access restricted
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          This page is only available to signed-in users. Log in to continue
          where you left off.
        </p>

        <div className="flex flex-col gap-2">
          <Link to="/signIn">
            <Button className="w-full cursor-pointer">Log in</Button>
          </Link>

          <Link to="/signUp">
            <Button variant="outline" className="w-full cursor-pointer">
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
