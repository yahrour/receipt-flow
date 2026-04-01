import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RootLayout } from "@/layouts/RootLayout";
import Home from "@/components/Home";
import Add from "@/components/Add";
import Dashboard from "@/components/Dashboard";
import Account from "@/components/Account";

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
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
