import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RootLayout } from "@/layouts/RootLayout";
import Home from "@/components/Home";
import Dashboard from "@/components/Dashboard";
import Account from "@/components/Account/Account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import { AuthLayout } from "./layouts/AuthLayout";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import Security from "./components/Account/Security/Security";
import AddReceipt from "./components/AddReceipt/AddReceipt";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", Component: Home },
      { path: "/dashboard", Component: Dashboard },
      {
        path: "/account",
        Component: Account,
      },
      { path: "/account/security", Component: Security },
      { path: "/add-receipt", Component: AddReceipt },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/signUp",
        Component: SignUp,
      },
      {
        path: "/signIn",
        Component: SignIn,
      },
      {
        path: "/forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "/reset-password",
        Component: ResetPassword,
      },
    ],
  },
]);

export const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
