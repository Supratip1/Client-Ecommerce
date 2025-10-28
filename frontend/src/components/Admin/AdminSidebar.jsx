import React from "react";
import {
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaStore,
  FaUser,
  FaChartLine,
  FaUsers,
  FaTags,
  FaCogs,
  FaChartBar,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slice/authSlice";
import { clearCart } from "../../redux/slice/cartSlice";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="mb-8">
        <Link to="/admin" className="text-2xl font-medium text-white hover:text-gray-300 transition-colors">
          DesiStyle
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-2">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaChartLine />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaChartBar />
          <span>Analytics</span>
        </NavLink>
        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaUsers />
          <span>Customers</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>
        <NavLink
          to="/admin/coupons"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaTags />
          <span>Coupons</span>
        </NavLink>
        <NavLink
          to="/admin/bulk-operations"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaCogs />
          <span>Bulk Operations</span>
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center space-x-3 font-medium"
              : "text-gray-300 hover:bg-gray-800 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-all duration-200"
          }
        >
          <FaStore />
          <span>View Shop</span>
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors font-medium"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
