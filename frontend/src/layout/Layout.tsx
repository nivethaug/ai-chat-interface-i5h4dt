import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070710] text-zinc-100">
      <Navbar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(3.75rem + env(safe-area-inset-bottom))" }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
