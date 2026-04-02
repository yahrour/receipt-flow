import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RootLayout } from "@/layouts/RootLayout";
import Home from "@/components/Home";
import Add from "@/components/Add";
import Dashboard from "@/components/Dashboard";
import Account from "@/components/Account/Account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import { AuthLayout } from "./layouts/AuthLayout";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", Component: Home },
      { path: "/add", Component: Add },
      { path: "/dashboard", Component: Dashboard },
      { path: "/account", Component: Account },
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
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
