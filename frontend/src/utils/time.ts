import { formatDistanceToNow } from "date-fns";

export function timeAgo(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
