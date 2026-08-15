import { jest, describe, beforeEach, it, expect } from "@jest/globals";

const mockQuery =
  jest.fn<(query: string, params?: any[]) => Promise<{ rows: any[] }>>();

jest.unstable_mockModule("../../src/lib/index.ts", () => ({
  query: mockQuery,
}));

const { getMonthlySummary, getYearlySpending, getCategoriesSpending } =
  await import("../../src/services/analytics.service");

const USER_ID = "user-1";
const YEAR = 2026;
const MONTH = 6;

const rows = (...rows: any[]) => ({ rows });
const expectCalledWith = (fragment: string, params: any[]) =>
  expect(mockQuery).toHaveBeenCalledWith(
    expect.stringContaining(fragment),
    params,
  );

describe("analytics service", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("getMonthlySummary", () => {
    it("returns parsed totals when receipts exist", async () => {
      mockQuery.mockResolvedValueOnce(
        rows({
          total_amount: "150.50",
          total_receipts: 3,
          average: "50.17",
        }),
      );

      const result = await getMonthlySummary(USER_ID, MONTH, YEAR);

      expect(result).toEqual({
        total_amount: 150.5,
        total_receipts: 3,
        average: 50.17,
      });
      expectCalledWith("FROM receipts", [USER_ID, MONTH, YEAR]);
    });

    it("returns zeroed values when there are no receipts", async () => {
      mockQuery.mockResolvedValueOnce(
        rows({ total_amount: "0", total_receipts: 0, average: "0" }),
      );

      const result = await getMonthlySummary(USER_ID, 1, YEAR);

      expect(result).toEqual({
        total_amount: 0,
        total_receipts: 0,
        average: 0,
      });
    });

    it("propagates errors from the query layer", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(getMonthlySummary(USER_ID, MONTH, YEAR)).rejects.toThrow(
        "db connection failed",
      );
    });
  });

  describe("getYearlySpending", () => {
    it("returns rows grouped by month", async () => {
      const data = [
        { month: "1", total: "200.00" },
        { month: "3", total: "75.00" },
      ];
      mockQuery.mockResolvedValueOnce(rows(...data));

      const result = await getYearlySpending(USER_ID, YEAR);

      expect(result).toEqual(data);
      expectCalledWith("GROUP BY month", [USER_ID, YEAR]);
    });

    it("returns an empty array when there is no spending", async () => {
      mockQuery.mockResolvedValueOnce(rows());

      await expect(getYearlySpending(USER_ID, YEAR)).resolves.toEqual([]);
    });
  });

  describe("getCategoriesSpending", () => {
    it("returns categories ordered by total", async () => {
      const data = [
        { category: "Groceries", total: "300.00" },
        { category: "Transport", total: "120.00" },
      ];
      mockQuery.mockResolvedValueOnce(rows(...data));

      const result = await getCategoriesSpending(USER_ID, MONTH, YEAR);

      expect(result).toEqual(data);
      expectCalledWith("GROUP BY category", [USER_ID, MONTH, YEAR]);
    });

    it("returns an empty array when there is no data for the period", async () => {
      mockQuery.mockResolvedValueOnce(rows());

      await expect(
        getCategoriesSpending(USER_ID, MONTH, YEAR),
      ).resolves.toEqual([]);
    });
  });
});
