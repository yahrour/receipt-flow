import { useDropzone } from "react-dropzone";
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { env } from "@/config/env";
import type z from "zod";
import { receiptSchema } from "@/schema";
import type { AddReceiptSchemaType } from "./AddReceipt";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";

type ReceiptSchemaType = z.infer<typeof receiptSchema>;
export type ResponseType = {
  success: boolean;
  message: string;
  data?: ReceiptSchemaType;
};

async function uploadReceipt(formData: FormData) {
  const res = await fetch(env.API_BASE_URL + "/api/receipts/analyze", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to analyze receipt");
  }

  const jsonData = (await res.json()) as ResponseType;
  if (jsonData.success === false) {
    throw new Error(
      jsonData.message ||
        "We couldn't analyze the receipt. Please try again or enter details manually.",
    );
  }
  return jsonData.data;
}

export default function ReceiptUpload({
  setData,
  setStep,
}: {
  setData: React.Dispatch<React.SetStateAction<AddReceiptSchemaType | null>>;
  setStep: React.Dispatch<React.SetStateAction<"upload" | "form">>;
}) {
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: uploadReceipt,
    onSuccess: (data) => {
      const parsedData = receiptSchema.safeParse(data);
      if (parsedData.error) {
        setError(
          "We couldn't read the receipt. Please try again or enter details manually.",
        );
        return;
      }
      setData({
        merchant: parsedData?.data.merchant || "",
        amount: parsedData?.data.amount || 0,
        date: parsedData?.data.date
          ? new Date(parsedData.data.date)
          : new Date(),
        category: parsedData?.data.category || "",
      });
      setStep("form");
    },
    onError: () => {
      setError(
        "We couldn't analyze the receipt. Please try again or enter details manually.",
      );
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("receipt", file);

    mutation.mutate(formData);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] }, // Images only
    maxFiles: 1, // Single file
    maxSize: 1024 * 1024 * 10, // 10MB limit
  });

  return (
    <div className="flex flex-col gap-10 justify-center items-center min-h-52">
      <p className="text-center text-gray-500">
        Upload your receipt and we'll extract the details automatically.
      </p>
      {/* Dropzone */}
      {!mutation.isPending ? (
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "#f0f8ff" : "#fafafa",
          }}
          className="w-full hover:bg-blue-50! hover:border-blue-300! hover:border-2! hover:border-dashed! cursor-pointer transition"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <div className="bg-blue-100 w-fit mx-auto mb-2 p-2 rounded-md">
              <Upload className="bg-blue-100 text-blue-400" />
            </div>
          )}
          <p>Tab to upload receipt</p>
          <p style={{ color: "#aaa", fontSize: "12px" }}>
            PNG, JPG or PDF up to 10MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="size-5" />
          <p className="text-gray-600">Analyzing receipt...</p>
        </div>
      )}
      {/* Add a link to the form to allow manual entry */}
      {!mutation.isPending && (
        <div className="text-sm text-muted-foreground flex flex-col items-center">
          <p className="m-0">Don't have a receipt image ?</p>
          <Button
            type="button"
            onClick={() => setStep("form")}
            className="text-blue-500 m-0 p-0 text-xs"
            variant="link"
          >
            Enter details manually
          </Button>
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
