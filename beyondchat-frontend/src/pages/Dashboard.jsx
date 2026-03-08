import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

export default Dashboard;