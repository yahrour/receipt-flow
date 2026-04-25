import { useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ChevronLeft, ChevronRight, Search, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RECEIPT_CATEGORIES } from "@/constants";
import { Button } from "../ui/button";
import { format } from "date-fns";

export function ActionBar({
  search,
  setSearch,
  category,
  setCategory,
  date,
  setDate,
}: {
  search: string | null;
  setSearch: React.Dispatch<React.SetStateAction<string | null>>;
  category: string | null;
  setCategory: React.Dispatch<React.SetStateAction<string | null>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const debounceTimer = useRef<undefined | number>(undefined);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(e.target.value);
    }, 500);
  };
  return (
    <div className="flex items-center justify-between gap-2 max-sm:flex-col">
      <InputGroup>
        <InputGroupInput
          placeholder="Search merchant"
          onChange={handleChange}
          id="searchInput"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon
          align="inline-end"
          className="cursor-pointer hover:text-black"
          onClick={() => {
            if (!search) return;
            setSearch("");
            const input = document.getElementById(
              "searchInput",
            ) as HTMLInputElement;
            if (input) {
              input.value = "";
            }
          }}
        >
          <XIcon />
        </InputGroupAddon>
      </InputGroup>
      <div className="flex items-center gap-2 w-full">
        <Select
          value={category || "all"}
          onValueChange={(value) => setCategory(value === "all" ? null : value)}
        >
          <SelectTrigger className="h-10 px-3! py-5! flex-3/4 min-w-0">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {RECEIPT_CATEGORIES.map((category) => (
                <SelectItem
                  value={category}
                  className="capitalize"
                  key={category}
                >
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

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
      </div>
    </div>
  );
}
