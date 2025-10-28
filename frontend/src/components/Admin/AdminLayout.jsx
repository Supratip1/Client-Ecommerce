import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* mobile toggle button */}
      <div className="flex md:hidden p-4 bg-black text-white z-20 shadow-md">
        <button onClick={toggleSidebar} className="hover:bg-gray-800 p-2 rounded-lg transition">
          <FaBars size={24} />
        </button>
        <h1 className="ml-4 text-xl font-medium">DesiStyle Admin</h1>
      </div>
      {/* overlay for mobile area */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      {/* sidebar */}
      <div
        className={`bg-gray-900 w-64 min-h-screen text-white absolute md:relative transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } 
      transition-transform duration-300 md:translate-x-0 md:static md:block z-20 shadow-xl`}
      >
        {/* Sidebar component */}
        <AdminSidebar/>
      </div>

      {/* main content */}
      <div className="flex-grow p-6 md:p-8 bg-gray-50 overflow-auto">
        <Outlet/>
      </div>
    </div>
  );
};

export default AdminLayout;
