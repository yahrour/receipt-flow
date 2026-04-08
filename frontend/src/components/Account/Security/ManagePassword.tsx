import { EyeIcon, EyeOffIcon, KeyRound } from "lucide-react";
import type { Props } from "./Security";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { timeAgo } from "@/utils/time";
import { Controller, useForm } from "react-hook-form";
import { updatePasswordSchema } from "@/schema";
import type z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Link } from "react-router";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
type MessageType = {
  success: boolean;
  message: string;
};

export function ManagePassword({ activePanel, setActivePanel }: Props) {
  const form = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => authClient.listAccounts(),
  });
  const [message, setMessage] = useState<MessageType | null>(null);
  const credentialAccount = accounts?.data?.find(
    (acc) => acc.providerId === "credential",
  );
  const lastUpdated = timeAgo(credentialAccount?.updatedAt || 0);

  if (isLoading) {
    return <Skeleton className="h-18 rounded-2xl" />;
  }

  const onSubmit = async (data: UpdatePasswordSchemaType) => {
    console.log("Submit");
    const { error } = await authClient.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
      revokeOtherSessions,
    });
    if (error) {
      setMessage({
        success: false,
        message: error.message || "Something went wrong",
      });
    } else {
      form.reset();
      setMessage({ success: true, message: "Password updated successfully" });
    }
  };

  return (
    <div>
      <div
        className={`cursor-pointer bg-white hover:bg-white/50 transition group flex items-center gap-4 p-4 ${activePanel === "password" ? "rounded-tl-2xl rounded-tr-2xl" : "rounded-2xl"}`}
        onClick={() => {
          setActivePanel(activePanel === "password" ? null : "password");
          form.reset();
          setMessage(null);
        }}
      >
        <div className="bg-gray-100 p-2 rounded-full">
          <KeyRound size={18} className="text-gray-400 stroke-2" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Password</p>
          <p className="text-xs text-gray-500">{lastUpdated || "Never"}</p>
        </div>
      </div>
      {activePanel === "password" && (
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full bg-white border-t rounded-bl-2xl rounded-br-2xl p-4 flex flex-col gap-4"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              name="currentPassword"
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
                      type={showCurrentPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
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
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
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
              name="confirmNewPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmNewPassword">
                    Confirm new password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="confirmNewPassword"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Separator />
            <div className="flex items-center gap-2">
              <Checkbox
                id="revoke-sessions"
                checked={revokeOtherSessions}
                onCheckedChange={(checked) =>
                  setRevokeOtherSessions(checked === true)
                }
                className="border-gray-500"
              />
              <label
                htmlFor="revoke-sessions"
                className="text-[12px] text-muted-foreground cursor-pointer select-none"
              >
                Sign out of all other devices
              </label>
            </div>
          </FieldGroup>
          {message && (
            <p
              className={`text-sm ${message.success ? "text-green-500" : "text-red-500"}`}
            >
              {message.message}
            </p>
          )}
          <div className="flex gap-2 items-center justify-end">
            <Button
              type="button"
              className="py-5 cursor-pointer w-[25%]"
              disabled={form.formState.isSubmitting}
              variant="secondary"
              onClick={() => {
                form.reset();
                setMessage(null);
                setActivePanel(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="py-5 cursor-pointer bg-black text-white hover:bg-black/80 w-[25%]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Spinner /> : "Update"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
