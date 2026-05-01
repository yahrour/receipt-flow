import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RootLayout } from "@/layouts/RootLayout";
import { Home } from "@/pages/Home/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout } from "./layouts/AuthLayout";
import { History } from "@/pages/History/index";
import { Add } from "./pages/Add";
import { Stats } from "./pages/Stats";
import { SignUp } from "./pages/SignUp";
import { SignIn } from "./pages/SignIn";
import { ForgotPassword } from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import { Account } from "./pages/Account";
import { Security } from "./pages/Account/Security";
import Settings from "./pages/Account/Settings";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", Component: Home },
      { path: "/history", Component: History },
      { path: "/stats", Component: Stats },
      { path: "/account", Component: Account },
      { path: "/account/security", Component: Security },
      { path: "/account/settings", Component: Settings },
      { path: "/add-receipt", Component: Add },
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
