import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import createError from "http-errors";

const mockQuery =
  jest.fn<(query: string, params?: any[]) => Promise<{ rows: any[] }>>();

jest.unstable_mockModule("../../src/lib/index.ts", () => ({
  query: mockQuery,
}));

const { UpdatePreferencesService, GetPreferencesService } =
  await import("../../src/services/preferences.service");

const USER_ID = "user-1";

const rows = (...rows: any[]) => ({ rows });

describe("preferences service", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("UpdatePreferencesService", () => {
    it("upserts the provided preferences and returns null", async () => {
      mockQuery.mockResolvedValueOnce(rows());

      const result = await UpdatePreferencesService(USER_ID, {
        currency: "USD",
      });

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO user_preferences"),
        [USER_ID, "USD"],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (user_id)"),
        [USER_ID, "USD"],
      );
    });

    it("throws a 500 error when the body fails schema validation", async () => {
      await expect(
        UpdatePreferencesService(USER_ID, {} as any),
      ).rejects.toMatchObject({ status: 500 });
    });

    it("rethrows http errors from the query layer", async () => {
      mockQuery.mockRejectedValueOnce(createError(409, "conflict"));

      await expect(
        UpdatePreferencesService(USER_ID, { currency: "USD" }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(
        UpdatePreferencesService(USER_ID, { currency: "USD" }),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("GetPreferencesService", () => {
    it("returns the user's preferences", async () => {
      const preference = { id: 1, currency: "USD" };
      mockQuery.mockResolvedValueOnce(rows(preference));

      const result = await GetPreferencesService(USER_ID);

      expect(result).toEqual(preference);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("FROM user_preferences"),
        [USER_ID],
      );
    });

    it("throws a 500 error when the query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db connection failed"));

      await expect(GetPreferencesService(USER_ID)).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
