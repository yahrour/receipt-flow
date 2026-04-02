import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <main className="p-4">
      <Outlet />
    </main>
  );
}
