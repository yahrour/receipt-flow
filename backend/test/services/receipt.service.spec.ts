import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { ZodError } from "zod";

const mockQuery =
  jest.fn<
    (
      query: string,
      params?: unknown[],
    ) => Promise<{ rows: unknown[]; rowCount?: number | null }>
  >();
const mockReadFile = jest.fn<() => Promise<Buffer>>();
const mockToBuffer = jest.fn<() => Promise<Buffer>>();
const mockGenerateContent =
  jest.fn<(args: unknown) => Promise<{ text?: string | null }>>();

jest.unstable_mockModule("../../src/lib/index.ts", () => ({
  query: mockQuery,
}));

jest.unstable_mockModule("fs/promises", () => ({
  default: { readFile: mockReadFile },
}));

jest.unstable_mockModule("sharp", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    rotate: jest.fn().mockReturnThis(),
    grayscale: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: mockToBuffer,
  })),
}));

jest.unstable_mockModule("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const {
  analyzeReceiptService,
  saveReceiptService,
  getReceiptsService,
  updateReceiptService,
  deleteReceiptService,
} = await import("../../src/services/receipt.service");

const USER_ID = "user-1";

const validReceipt = {
  merchant: "Starbucks",
  amount: 12.99,
  date: "2026-06-01",
  category: "restaurant" as const,
  currency: "USD",
};

const queryResult = (rows: unknown[], rowCount?: number | null) => ({
  rows,
  rowCount: rowCount ?? rows.length,
});

describe("receipt service", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockReadFile.mockReset();
    mockToBuffer.mockReset();
    mockGenerateContent.mockReset();
  });

  describe("analyzeReceiptService", () => {
    it("returns parsed receipt data", async () => {
      mockReadFile.mockResolvedValue(Buffer.from("image-bytes"));
      mockToBuffer.mockResolvedValue(Buffer.from("optimized"));
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(validReceipt),
      });

      const result = await analyzeReceiptService(
        "/tmp/receipt.jpg",
        "image/jpeg",
      );

      expect(result).toEqual(validReceipt);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: "gemini-2.5-flash" }),
      );
    });

    it("throws a 400 error when no file is provided", async () => {
      await expect(
        analyzeReceiptService(undefined, undefined),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws a 415 error for unsupported file types", async () => {
      await expect(
        analyzeReceiptService("/tmp/receipt.pdf", "application/pdf"),
      ).rejects.toMatchObject({ status: 415 });
    });

    it("throws a 500 error when the model returns no text", async () => {
      mockReadFile.mockResolvedValue(Buffer.from("image-bytes"));
      mockToBuffer.mockResolvedValue(Buffer.from("optimized"));
      mockGenerateContent.mockResolvedValue({ text: "" });

      await expect(
        analyzeReceiptService("/tmp/receipt.jpg", "image/jpeg"),
      ).rejects.toMatchObject({ status: 500 });
    });

    it("throws a ZodError when the model returns data that fails validation", async () => {
      mockReadFile.mockResolvedValue(Buffer.from("image-bytes"));
      mockToBuffer.mockResolvedValue(Buffer.from("optimized"));
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ merchant: "Starbucks" }),
      });

      await expect(
        analyzeReceiptService("/tmp/receipt.jpg", "image/jpeg"),
      ).rejects.toBeInstanceOf(ZodError);
    });
  });

  describe("saveReceiptService", () => {
    it("saves a valid receipt and returns it", async () => {
      mockQuery.mockResolvedValueOnce(queryResult([]));

      const result = await saveReceiptService(validReceipt, USER_ID);

      expect(result).toEqual(validReceipt);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO receipts"),
        [USER_ID, "Starbucks", 12.99, "2026-06-01", "restaurant", "USD"],
      );
    });

    it("throws a 400 error for an invalid receipt", async () => {
      await expect(
        // @ts-expect-error ignore
        saveReceiptService({ merchant: "Starbucks" } as unknown, USER_ID),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(
        saveReceiptService(validReceipt, USER_ID),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("getReceiptsService", () => {
    const date = new Date(2026, 5, 15); // June 2026

    it("returns receipts with a next cursor when there are more pages", async () => {
      const rows = Array.from({ length: 11 }, (_, i) => ({ id: i + 1 }));
      mockQuery.mockResolvedValueOnce(queryResult(rows, 11));

      const result = await getReceiptsService(
        USER_ID,
        undefined,
        null,
        null,
        date,
      );

      expect(result.hasNextPage).toBe(true);
      expect(result.receipts).toHaveLength(10);
      expect(result.nextCursor).toBe(
        Buffer.from("10", "utf-8").toString("base64"),
      );
    });

    it("returns no next cursor when there are no more pages", async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValueOnce(queryResult(rows, 2));

      const result = await getReceiptsService(
        USER_ID,
        undefined,
        null,
        null,
        date,
      );

      expect(result.hasNextPage).toBe(false);
      expect(result.receipts).toEqual(rows);
      expect(result.nextCursor).toBeNull();
    });

    it("decodes the cursor and passes it to the query", async () => {
      const cursor = Buffer.from("42", "utf-8").toString("base64");
      mockQuery.mockResolvedValueOnce(queryResult([]));

      await getReceiptsService(USER_ID, cursor, null, null, date);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("id < $2"),
        expect.arrayContaining(["42"]),
      );
    });

    it("applies search and category filters", async () => {
      mockQuery.mockResolvedValueOnce(queryResult([]));

      await getReceiptsService(
        USER_ID,
        undefined,
        "starbucks",
        "restaurant",
        date,
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(merchant) LIKE LOWER($4)"),
        expect.arrayContaining(["%starbucks%", "%restaurant%"]),
      );
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(
        getReceiptsService(USER_ID, undefined, null, null, date),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("updateReceiptService", () => {
    it("throws a 400 error for an invalid id", async () => {
      await expect(
        updateReceiptService("abc", validReceipt, USER_ID),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws a 400 error for an invalid receipt body", async () => {
      await expect(
        updateReceiptService(
          "1",
          // @ts-expect-error ignore
          { merchant: "Starbucks" } as unknown,
          USER_ID,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("updates the receipt and returns the updated row", async () => {
      const updated = { id: 1, ...validReceipt };
      mockQuery.mockResolvedValueOnce(queryResult([updated], 1));

      const result = await updateReceiptService("1", validReceipt, USER_ID);

      expect(result).toEqual(updated);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE receipts"),
        ["Starbucks", 12.99, "2026-06-01", "restaurant", "USD", 1, USER_ID],
      );
    });

    it("throws a 500 error when the receipt is not found", async () => {
      mockQuery.mockResolvedValueOnce(queryResult([], 0));

      await expect(
        updateReceiptService("1", validReceipt, USER_ID),
      ).rejects.toMatchObject({ status: 500 });
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(
        updateReceiptService("1", validReceipt, USER_ID),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("deleteReceiptService", () => {
    it("throws a 400 error for an invalid id", async () => {
      await expect(deleteReceiptService("abc", USER_ID)).rejects.toMatchObject({
        status: 400,
      });
    });

    it("deletes the receipt and returns null", async () => {
      mockQuery.mockResolvedValueOnce(queryResult([], 1));

      const result = await deleteReceiptService("1", USER_ID);

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM receipts"),
        [1, USER_ID],
      );
    });

    it("throws a 404 error when the receipt is not found", async () => {
      mockQuery.mockResolvedValueOnce(queryResult([], 0));

      await expect(deleteReceiptService("1", USER_ID)).rejects.toMatchObject({
        status: 404,
      });
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(deleteReceiptService("1", USER_ID)).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
