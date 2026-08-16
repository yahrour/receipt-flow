import { jest, describe, beforeEach, it, expect } from "@jest/globals";

const mockVerifyPassword = jest.fn<(args: unknown) => Promise<unknown>>();
const mockChangeEmail = jest.fn<(args: unknown) => Promise<unknown>>();
const mockFromNodeHeaders = jest.fn<(headers: unknown) => unknown>();

jest.unstable_mockModule("../../src/lib/index.ts", () => ({
  auth: {
    api: {
      verifyPassword: mockVerifyPassword,
      changeEmail: mockChangeEmail,
    },
  },
}));

jest.unstable_mockModule("better-auth/node", () => ({
  fromNodeHeaders: mockFromNodeHeaders,
}));

const { updateEmailService } = await import("../../src/services/user.service");

const headers = { "content-type": "application/json" };

describe("user service", () => {
  beforeEach(() => {
    mockVerifyPassword.mockReset();
    mockChangeEmail.mockReset();
    mockFromNodeHeaders.mockReset();
    mockFromNodeHeaders.mockImplementation((h: unknown) => h);
  });

  describe("updateEmailService", () => {
    it("verifies the password and changes the email", async () => {
      mockVerifyPassword.mockResolvedValue({});
      mockChangeEmail.mockResolvedValue({});

      await updateEmailService({
        newEmail: "new@example.com",
        currentPassword: "secret123",
        headers,
      });

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { password: "secret123" },
          headers: expect.anything(),
        }),
      );
      expect(mockChangeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            newEmail: "new@example.com",
            callbackURL: "http://localhost:5173/account/security",
          },
        }),
      );
    });

    it("throws a 400 error when the password is incorrect", async () => {
      mockVerifyPassword.mockRejectedValue(new Error("invalid password"));

      await expect(
        updateEmailService({
          newEmail: "new@example.com",
          currentPassword: "wrong",
          headers,
        }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws a 500 error when changing the email fails", async () => {
      mockVerifyPassword.mockResolvedValue({});
      mockChangeEmail.mockRejectedValue(new Error("email in use"));

      await expect(
        updateEmailService({
          newEmail: "new@example.com",
          currentPassword: "secret123",
          headers,
        }),
      ).rejects.toMatchObject({ status: 500 });
    });
  });
});
