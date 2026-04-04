import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <main className="p-4 flex flex-col justify-center items-center min-h-dvh">
      <Outlet />
    </main>
  );
}
