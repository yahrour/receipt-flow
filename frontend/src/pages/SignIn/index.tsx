import { signInSchema } from "@/schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { authClient } from "@/lib/auth";
import { useEffect, useState } from "react";
import { env } from "@/config/env";
import { useQuery } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

type SignInSchema = z.infer<typeof signInSchema>;

export function SignIn() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignInSchema) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: env.APP_URL,
      },
      {
        onError: (err) => setError(err.error.message),
      },
    );
  };

  useEffect(() => {
    if (session?.data?.user) {
      void navigate("/account", { replace: true });
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner className="size-7" />
      </div>
    );
  }

  if (session?.data?.user) void navigate("/account", { replace: true });

  return (
    <div className="min-h-162.5 flex flex-col gap-8 w-full max-w-sm">
      <h1 className="text-2xl">Sign In to ReceiptFlow</h1>
      <div className="flex flex-col gap-6">
        <GoogleAuthButton />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-between items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-right text-muted-foreground hover:text-foreground"
                    >
                      Forgot ?
                    </Link>
                  </div>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          {error && <p className="text-red-500 text-xs font-normal">{error}</p>}
          <Button
            type="submit"
            className="w-full py-5 cursor-pointer bg-black text-white hover:bg-black/80"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Sign In"}
          </Button>
        </form>
      </div>
      <Separator />
      <div className="text-sm text-center space-x-2">
        <span className="text-gray-500">No account?</span>
        <Link to="/signUp" className="hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
