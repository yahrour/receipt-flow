import { Controller, useForm } from "react-hook-form";
import { updateEmailSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { env } from "@/config/env";
import { EyeIcon, EyeOffIcon, Mail } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import type { ApiResponse, Message } from "@/types";
import type { SecurityContextState } from "./types";

type UpdateEmailSchema = z.infer<typeof updateEmailSchema>;

async function updateEmail(data: UpdateEmailSchema) {
  const res = await fetch(env.API_BASE_URL + "/api/users/email", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const resJson = (await res.json().catch(() => null)) as ApiResponse | null;

  if (!res.ok) {
    throw new Error(resJson?.message || "Failed to update email, try again.");
  }

  if (!resJson?.success) {
    throw new Error(resJson?.message || "Failed to update email, try again.");
  }
}

export function ManageEmail({
  activeSection,
  setActiveSection,
}: SecurityContextState) {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const form = useForm<UpdateEmailSchema>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const mutate = useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      setMessage({
        success: true,
        message: "Email updated successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      setMessage({
        success: false,
        message: error.message || "Failed to update email",
      });
    },
  });

  const onSubmit = async (data: UpdateEmailSchema) => {
    await mutate.mutateAsync(data);
  };

  if (isLoading) {
    return <Skeleton className="h-18 rounded-2xl" />;
  }

  return (
    <div>
      <div
        className={`cursor-pointer bg-white hover:bg-white/50 transition group flex items-center gap-4 p-4 ${activeSection === "email" ? "rounded-tl-2xl rounded-tr-2xl" : "rounded-2xl"}`}
        onClick={() => {
          setActiveSection(activeSection === "email" ? null : "email");
          form.reset();
        }}
      >
        <div className="bg-gray-100 p-2 rounded-full">
          <Mail size={18} className="text-gray-400 stroke-2" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Email Address</p>
          <p className="text-xs text-gray-500">{session?.data?.user.email}</p>
        </div>
      </div>
      <AnimatePresence>
        {activeSection === "email" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full bg-white border-t rounded-bl-2xl rounded-br-2xl p-4 flex flex-col gap-4"
            >
              <FieldGroup className="flex flex-col gap-4">
                <Controller
                  name="newEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="newEmail">New email</FieldLabel>
                      <Input
                        {...field}
                        id="newEmail"
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
                  name="currentPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="currentPassword">
                        Current password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="currentPassword"
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
                  className="py-5 cursor-pointer w-[30%]"
                  disabled={form.formState.isSubmitting}
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    setActiveSection(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="py-5 cursor-pointer bg-black text-white hover:bg-black/80 w-[30%]"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? <Spinner /> : "Update"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
