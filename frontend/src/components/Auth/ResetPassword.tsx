import { resetPasswordSchema } from "@/schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/types";

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token");
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [message, setMessage] = useState<Message | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return <div>Token not found</div>;
  }

  const onSubmit = async (formData: ResetPasswordSchema) => {
    const { error } = await authClient.resetPassword({
      newPassword: formData.password,
      token,
    });

    if (error) {
      // Handle specific error codes
      switch (error.code) {
        case "INVALID_TOKEN":
          setMessage({
            success: false,
            message:
              "This reset link is invalid or has expired. Please request a new one.",
          });
          break;
        case "PASSWORD_TOO_SHORT":
          setMessage({
            success: false,
            message: "Password is too short. Must be at least 8 characters.",
          });
          break;
        case "BAD_REQUEST":
          setMessage({
            success: false,
            message:
              "Invalid request. Please check your password and try again.",
          });
          break;
        default:
          setMessage({
            success: false,
            message: "Failed to reset password. Please try again.",
          });
      }
      return;
    }
    setMessage({ success: true, message: "Password reset successfully." });
    form.reset();
  };

  if (isLoading) return <Spinner className="size-8" />;
  if (session?.data?.user) void navigate("/account", { replace: true });

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      <div>
        <h1 className="text-xl">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">New password</FieldLabel>
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
          {message && !message.success && (
            <p className="text-red-500 text-xs font-normal">
              {message.message}
            </p>
          )}
          <div className="flex justify-between items-center">
            {message && message.success && (
              <p className="text-green-500 text-xs font-normal">
                {message.message}
              </p>
            )}
            {message?.success && (
              <Link
                to="/signIn"
                className="text-xs text-right text-muted-foreground hover:text-foreground"
              >
                Go to sign in
              </Link>
            )}
          </div>
          <Button
            type="submit"
            className="w-full py-5 cursor-pointer bg-black text-white hover:bg-black/80"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
