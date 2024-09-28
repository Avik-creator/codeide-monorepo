import Titlebar from "./TitleBar";
import Sidebar from "../components/Sidebar";
import Bottombar from "./Bottombar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Titlebar />
      <div className="flex  bg-[var(--main-bg)]">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>

      <Bottombar />
    </>
  );
};

export default Layout;
