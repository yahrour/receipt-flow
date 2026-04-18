import { RECEIPT_CATEGORIES } from "@/constants";
import z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "Please set a name").max(50, "name too long"),
  email: z.email(),
  password: z
    .string()
    .min(1, "Please set a password")
    .min(8, "password too short"),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Please set a password"),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Please set a password")
      .min(8, "password too short"),
    confirmPassword: z
      .string()
      .min(1, "please set a password")
      .min(8, "password too short"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Password don't match",
    path: ["confirmPassword"],
  });

export const updateEmailSchema = z.object({
  newEmail: z.email(),
  currentPassword: z
    .string()
    .min(1, "Please set a password")
    .min(8, "password too short"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "please set the password")
      .min(8, "password too short"),
    newPassword: z
      .string()
      .min(1, "please set a new password")
      .min(8, "password too short"),
    confirmNewPassword: z
      .string()
      .min(1, "please set a password")
      .min(8, "password too short"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    error: "Password don't match",
    path: ["confirmNewPassword"],
  });

export const receiptSchema = z.object({
  merchant: z
    .string()
    .trim()
    .min(1, "please enter the merchant name")
    .max(255, "Merchant name too long"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  category: z.enum(RECEIPT_CATEGORIES, {
    error: "Please select a valid category",
  }),
  currency: z.string().trim(),
});
