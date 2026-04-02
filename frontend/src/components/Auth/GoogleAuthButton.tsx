import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { authClient } from "@/lib/auth";

const GoogleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
    <path
      fill="#4285F4"
      d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.873h5.382a4.604 4.604 0 0 1-1.996 3.019v2.505h3.236c1.891-1.741 2.978-4.309 2.978-7.352Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.964-.895 6.618-2.421l-3.236-2.505c-.895.6-2.041.955-3.382.955-2.604 0-4.809-1.759-5.595-4.123H3.06v2.586A9.998 9.998 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.405 13.906A5.996 5.996 0 0 1 6.091 12c0-.662.114-1.305.314-1.906V7.51H3.06A10 10 0 0 0 2 12c0 1.614.386 3.14 1.06 4.49l3.345-2.584Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.971c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.986 14.695 2 12 2A9.998 9.998 0 0 0 3.06 7.51l3.345 2.584C7.19 7.73 9.395 5.971 12 5.971Z"
    />
  </svg>
);

export function GoogleAuthButton() {
  const handleGoogleAuth = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: env.APP_URL,
    });
  };
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-10 justify-center gap-3 rounded-md border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={handleGoogleAuth}
    >
      <GoogleIcon />
      <span>Continue With Google</span>
    </Button>
  );
}
