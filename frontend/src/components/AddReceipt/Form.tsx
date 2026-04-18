import { receiptSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Store } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { DatePicker } from "./DatePicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useNavigate } from "react-router";
import type { ApiResponse, Message } from "@/types";
import { RECEIPT_CATEGORIES } from "@/constants";
import type { ReceiptSchema } from "./types";

type ReceiptFormValues = z.input<typeof receiptSchema>;
type Props = {
  merchant?: string;
  amount?: number;
  date?: Date;
  category?: (typeof RECEIPT_CATEGORIES)[number];
};

export default function Form({ merchant, amount, date, category }: Props) {
  const form = useForm<ReceiptFormValues, unknown, ReceiptSchema>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      merchant: merchant || "",
      amount: typeof amount === "number" ? String(amount) : "",
      date: date || new Date(),
      category: category || "other",
    },
  });

  const [currency, setCurrency] = useState<string | null>(null);

  const fetchPreferences = async () => {
    const res = await fetch(env.API_BASE_URL + "/api/preferences", {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch preferences");
    }

    const jsonData = (await res.json()) as ApiResponse<{
      id: number;
      currency: string;
    }>;
    setCurrency(jsonData.data.currency);
    return jsonData;
  };

  useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  });

  const [message, setMessage] = useState<Message | null>(null);

  const navigate = useNavigate();

  const saveReceipt = async (formData: ReceiptSchema) => {
    const res = await fetch(env.API_BASE_URL + "/api/receipts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("We couldn't save the receipt, Please try again.");
    }

    const jsonData = (await res.json()) as ApiResponse;
    if (jsonData.success === false) {
      throw new Error(
        jsonData.message || "We couldn't save the receipt, Please try again.",
      );
    }
  };

  const mutation = useMutation({
    mutationFn: saveReceipt,
    onSuccess: () => {
      form.reset();
      void navigate("/");
    },
    onError: (error: unknown) => {
      console.log("save receipt error: ", error);
      setMessage({ success: false, message: "Failed to save receipt" });
    },
  });

  const onSubmit = (data: ReceiptSchema) => {
    setMessage(null);
    if (!currency) {
      return setMessage({
        success: false,
        message: "Please select the preferred currency in the account settings",
      });
    }
    mutation.mutate({
      merchant: data.merchant,
      amount: data.amount,
      category: data.category,
      date: data.date,
      currencySymbol: currency,
    });
  };

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-4"
    >
      <div
        role="note"
        className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2"
      >
        <CircleAlert
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-destructive"
        />

        <div className="space-y-0.5">
          <p className="text-sm">Review before saving</p>
          <p className="text-sm text-muted-foreground">
            Review the extracted details and edit if needed.
          </p>
        </div>
      </div>
      <FieldGroup className="flex flex-col gap-4">
        <Controller
          name="merchant"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="merchant">Merchant</FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="merchant"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="e.g. Whole Foods"
                  className="placeholder:text-sm placeholder:tracking-wider"
                />
                <InputGroupAddon align="inline-start">
                  <Store className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>

              <InputGroup>
                <InputGroupInput
                  id="amount"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={
                    typeof field.value === "string" ||
                    typeof field.value === "number"
                      ? String(field.value)
                      : ""
                  }
                  type="text"
                  inputMode="decimal"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="0.00"
                  className="placeholder:text-sm placeholder:tracking-wider"
                />
                <InputGroupAddon align="inline-start">
                  <span className="text-muted-foreground">{currency}</span>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="date"
          control={form.control}
          render={() => (
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <DatePicker defaultValue={form.getValues("date")} form={form} />
            </Field>
          )}
        />

        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category">Category</FieldLabel>

              <div className="flex flex-wrap gap-2">
                {RECEIPT_CATEGORIES.map((category) => {
                  const isSelected = category === field.value;

                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => field.onChange(category)}
                      className={
                        "px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 " +
                        (isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-border")
                      }
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
      <Button
        type="submit"
        className="w-full py-5 cursor-pointer "
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? <Spinner /> : "Confirm & Save"}
      </Button>
    </form>
  );
}
