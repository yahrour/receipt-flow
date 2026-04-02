import { signInSchema } from "@/schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Link } from "react-router";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { authClient } from "@/lib/auth";
import { useState } from "react";
import { env } from "@/config/env";

type SignInSchemaType = z.infer<typeof signInSchema>;

export default function SignUp() {
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SignInSchemaType) => {
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

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <h1>Create your account</h1>
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
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          {error && <p className="text-red-500 text-xs font-normal">{error}</p>}
          <Button type="submit" className="w-full py-5 cursor-pointer">
            Submit
          </Button>
        </form>
      </div>
      <Separator />
      <div className="text-sm text-center space-x-2">
        <span className="text-gray-500">Don't have an account?</span>
        <Link to="/signUp" className="hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
