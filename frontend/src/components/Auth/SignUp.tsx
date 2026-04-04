import { signUpSchema } from "@/schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Link, useNavigate } from "react-router";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { authClient } from "@/lib/auth";
import { useEffect, useState } from "react";
import { env } from "@/config/env";
import { useQuery } from "@tanstack/react-query";
import { EyeOffIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";

type SignUpSchemaType = z.infer<typeof signUpSchema>;
type MessageType = {
  success: boolean;
  message: string;
};
export default function SignUp() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session?.data?.user) {
      void navigate("/account", { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = async (data: SignUpSchemaType) => {
    const { error } = await authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: env.APP_URL,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );

    if (error === null) {
      setMessage({
        message:
          "If this email is not registered, a verification link has been sent.",
        success: true,
      });
    } else {
      switch (error?.code) {
        case "PASSWORD_TOO_SHORT":
          form.setError("password", {
            type: "custom",
            message: "password too short",
          });
          break;
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          form.setError("email", {
            type: "custom",
            message: "email already exist",
          });
          break;
        default:
          setMessage({
            message: "Some went wrong. Try again.",
            success: false,
          });
      }
    }
  };

  if (isLoading) return <Spinner className="size-8" />;
  if (session?.data?.user) void navigate("/account", { replace: true });

  return (
    <div className="min-h-162.5 flex flex-col gap-8 w-full max-w-sm">
      <h1 className="text-2xl">Create your account</h1>
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
          className="flex flex-col gap-4"
        >
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
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
                        <EyeOffIcon />
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
          {message && message.success && (
            <p className="text-green-500 text-xs font-normal">
              {message.message}
            </p>
          )}
          {message && !message.success && (
            <p className="text-red-500 text-xs font-normal">
              {message.message}
            </p>
          )}
          <Button
            type="submit"
            className="w-full py-5 cursor-pointer bg-black text-white hover:bg-black/80"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Sign Up"}
          </Button>
        </form>
      </div>
      <Separator />
      <div className="text-sm text-center space-x-2">
        <span className="text-gray-500">Already have an account?</span>
        <Link to="/signIn" className="hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
