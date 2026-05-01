import { Link } from "react-router";
import { Button } from "../ui/button";

export function ReceiptEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-lg font-semibold">No receipts yet</h3>
      <p className="max-w-xs mt-1 mb-6 text-sm text-muted-foreground">
        Scan your first receipt to start tracking your spending and getting
        insights.
      </p>
      <Link to="/add-receipt">
        <Button className="gap-2 cursor-pointer" variant="link">
          Click here to Add Receipt
        </Button>
      </Link>
    </div>
  );
}
