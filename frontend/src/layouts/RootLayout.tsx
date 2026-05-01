import { BottomTabBar } from "@/components/BottomTabBar";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

export function RootLayout() {
  return (
    <>
      <main className="p-4 pb-20 mx-auto">
        <Outlet />
      </main>
      <ToastContainer />
      <BottomTabBar />
    </>
  );
}
