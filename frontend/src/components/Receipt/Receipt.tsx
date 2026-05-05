import type { RECEIPT_CATEGORIES } from "@/constants";
import { queryClient } from "@/main";
import { fetchUserPreferences, handleDeleteReceipt } from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { toast } from "react-toastify";
import { EditReceiptDialog } from "./EditReceipt";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { ReceiptIcon } from "./ReceiptIcon";

type Props = {
  receipt: {
    id: number;
    merchant: string;
    category: (typeof RECEIPT_CATEGORIES)[number];
    amount: number;
    date: Date;
  };
  firstOne: boolean;
  lastOne: boolean;
};
export function Receipt({ receipt, firstOne, lastOne }: Props) {
  const REVEAL_WIDTH = 128;
  const { data: preferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });
  const mutate = useMutation({
    mutationFn: handleDeleteReceipt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });

  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const startOffset = useRef(0);

  const handlers = useSwipeable({
    onSwipeStart: () => {
      startOffset.current = revealed ? -REVEAL_WIDTH : 0;
    },
    onSwiping: ({ deltaX }) => {
      const next = startOffset.current + deltaX;
      setOffset(Math.min(0, Math.max(-(REVEAL_WIDTH + 16), next)));
    },
    onSwipedLeft: () => {
      setOffset(-REVEAL_WIDTH);
      setRevealed(true);
    },
    onSwipedRight: () => {
      setOffset(0);
      setRevealed(false);
    },
    trackMouse: true,
    trackTouch: true,
    delta: { up: 10000, down: 10000, left: 10, right: 10 }, // ignore vertical swipes entirely
    preventScrollOnSwipe: true,
    swipeDuration: 500,
  });

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Deleting...", {
      closeOnClick: true,
      draggable: true,
      position: "top-center",
    });
    const result = await mutate.mutateAsync(id);
    if (result?.success) {
      toast.update(toastId, {
        autoClose: 2000,
        render: "Receipt deleted",
        type: "success",
        isLoading: false,
      });
    } else {
      toast.update(toastId, {
        autoClose: 2000,
        render: "Failed to delete receipt",
        type: "error",
        isLoading: false,
      });
    }
  };

  const close = () => {
    setOffset(0);
    setRevealed(false);
  };

  return (
    <div className="relative overflow-hidden select-none">
      <div className="absolute inset-y-0 right-0 flex">
        <EditReceiptDialog
          id={receipt.id}
          merchant={receipt.merchant}
          amount={receipt.amount}
          date={receipt.date}
          category={receipt.category}
          close={close}
        />
        <Button
          onClick={() => {
            void handleDelete(receipt.id);
            close();
          }}
          variant="destructive"
          className={`w-16 h-full rounded-tl-none rounded-bl-none ${firstOne ? "rounded-tr-xl" : "rounded-tr-none"} ${lastOne ? "rounded-br-xl" : "rounded-br-none"} m-0 cursor-pointer flex flex-col gap-1 justify-center`}
        >
          <Trash2 className="size-5" />
          <span className="text-xs tracking-wider">Delete</span>
        </Button>
      </div>

      <div
        {...handlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition:
            offset === 0 || offset === -REVEAL_WIDTH
              ? "transform 0.25s ease"
              : "none",
        }}
        className={`bg-white flex justify-between items-center p-3 relative z-10 cursor-grab active:cursor-grabbing touch-pan-y ${firstOne && lastOne ? "rounded-xl" : firstOne ? "rounded-t-xl" : lastOne ? "rounded-b-xl" : "rounded-none"} ${revealed && "rounded-tr-none rounded-br-none"}`}
        onClick={() => revealed && close()}
      >
        <div className="flex items-center gap-4">
          <ReceiptIcon category={receipt.category} />
          <div>
            <p className="font-medium capitalize m-0 p-0">{receipt.merchant}</p>
            <span className="text-gray-500 capitalize text-sm">
              {receipt.category}
            </span>
          </div>
        </div>
        <div className="font-medium space-x-0.5">
          <span>-</span>
          <span>{preferences?.data.currency}</span>
          <span>{receipt.amount}</span>
        </div>
      </div>
    </div>
  );
}
