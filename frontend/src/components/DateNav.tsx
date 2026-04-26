import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export function DateNav({
  date,
  setDate,
}: {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
  return (
    <Button
      className="flex-1/4 flex items-center justify-between hover:bg-transparent p-0"
      variant="ghost"
    >
      <div
        className="cursor-pointer p-2 hover:bg-gray-100 hover:rounded-full"
        onClick={() => {
          const month = new Date(date.toString()).getMonth() - 1;
          setDate(new Date(date.setMonth(month)));
        }}
      >
        <ChevronLeft />
      </div>
      <span>{format(date, "MMMM yyyy")}</span>
      <div
        className="cursor-pointer p-2 hover:bg-gray-100 hover:rounded-full"
        onClick={() => {
          const month = new Date(date.toString()).getMonth() + 1;
          setDate(new Date(date.setMonth(month)));
        }}
      >
        <ChevronRight />
      </div>
    </Button>
  );
}
