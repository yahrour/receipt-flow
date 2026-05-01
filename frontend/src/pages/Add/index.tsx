import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ReceiptSchema } from "./types";
import Form from "./Form";
import Upload from "./Upload";
import AuthRequired from "@/components/AuthRequired";
import { Spinner } from "@/components/ui/spinner";

export function Add() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const [data, setData] = useState<ReceiptSchema | null>(null);
  const [step, setStep] = useState<"upload" | "form">("upload");

  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner className="size-7" />
      </div>
    );
  }
  if (!session?.data?.user) {
    return <AuthRequired />;
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        {step === "form" && (
          <ArrowLeft
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setStep("upload")}
            size={18}
          />
        )}
        <h1 className="text-3xl max-sm:text-2xl font-medium">Add Receipt</h1>
      </div>
      <div className="flex gap-2">
        <div
          className={`flex-1 h-1 rounded-full ${step === "upload" || step === "form" ? "bg-blue-500" : "bg-gray-200"}`}
        />
        <div
          className={`flex-1 h-1 rounded-full ${step === "form" ? "bg-blue-500" : "bg-gray-200"}`}
        />
      </div>
      {step === "upload" && <Upload setData={setData} setStep={setStep} />}
      {step === "form" && (
        <Form
          merchant={data?.merchant}
          amount={data?.amount}
          date={data?.date}
          category={data?.category}
        />
      )}
    </div>
  );
}
