import { forgotPasswordSchema } from "@/schema";
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
import { Link } from "react-router";
import { authClient } from "@/lib/auth";
import { useState } from "react";
import { env } from "@/config/env";
import { Spinner } from "@/components/ui/spinner";
import type { Message } from "@/types";

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const [message, setMessage] = useState<Message | null>(null);

  const onSubmit = async (formData: ForgotPasswordSchema) => {
    const { error } = await authClient.requestPasswordReset({
      email: formData.email,
      redirectTo: env.APP_URL + "/reset-password",
    });

    if (error) {
      switch (error.code) {
        case "BAD_REQUEST":
          setMessage({
            success: false,
            message: "Invalid request. Please check your email address.",
          });
          break;
        case "INTERNAL_SERVER_ERROR":
          setMessage({
            success: false,
            message: "Something went wrong. Please try again later.",
          });
          break;
        default:
          setMessage({
            success: false,
            message: "Failed to send reset email.",
          });
      }
      return;
    } else {
      setMessage({
        success: true,
        message: "If this email exists, you'll receive a reset link shortly.",
      });
    }
  };

  return (
    // <div className="flex flex-col gap-8 w-full max-w-md absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
    <div className="flex flex-col gap-8 w-full max-w-sm">
      <div>
        <h1 className="text-xl">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
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
            {form.formState.isSubmitting ? <Spinner /> : "Send reset link"}
          </Button>
        </form>
      </div>
      <Separator />
      <div className="text-sm space-x-2">
        <span className="text-gray-500">Remember your password?</span>
        <Link to="/signUp" className="hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
