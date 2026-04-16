import { authClient } from "@/lib/auth";
import { addReceiptSchema } from "@/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import type z from "zod";
import ReceiptUpload from "./ReceiptUpload";
import AddReceiptForm from "./AddReceiptForm";
import { ArrowLeft } from "lucide-react";

export type AddReceiptSchemaType = z.infer<typeof addReceiptSchema>;

export default function AddReceipt() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const navigate = useNavigate();
  const [data, setData] = useState<AddReceiptSchemaType | null>(null);
  const [step, setStep] = useState<"upload" | "form">("upload");

  if (isLoading) {
    return <p>Loading</p>;
  }
  if (!session?.data?.user) void navigate("/signIn", { replace: true });

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
      {step === "upload" && (
        <ReceiptUpload setData={setData} setStep={setStep} />
      )}
      {step === "form" && (
        <AddReceiptForm
          merchant={data?.merchant}
          amount={data?.amount}
          date={data?.date}
          category={data?.category}
        />
      )}
    </div>
  );
}
