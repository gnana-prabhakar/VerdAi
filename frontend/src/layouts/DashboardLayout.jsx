import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen antialiased overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-grow p-5 sm:p-6 lg:p-8" style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
