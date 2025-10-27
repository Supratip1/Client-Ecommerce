import React, { useEffect } from "react";
import MyOrdersPage from "./MyOrdersPage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import { API_BASE_URL } from "../config/api";

const Profile = () => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if(!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    // Don't clear cart - keep it persistent across logout/login
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* left section */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6 bg-white">
            <div className="flex flex-col items-center mb-6">
              {user?.avatar ? (
                <img 
                  src={user.avatar.includes('googleusercontent.com') 
                    ? `${API_BASE_URL}/api/proxy/google-avatar/${encodeURIComponent(user.avatar)}`
                    : user.avatar
                  } 
                  alt={user.name} 
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 mb-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`h-20 w-20 rounded-full bg-gray-200 items-center justify-center mb-4 ${user?.avatar ? 'hidden' : 'flex'}`}
              >
                <span className="text-2xl font-bold text-gray-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-center mb-2 break-words px-2">{user?.name}</h1>
            </div>
            <p className="text-sm text-gray-600 mb-4 text-center break-all px-2 leading-relaxed">{user?.email}</p>
            <button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200">
              Logout
            </button>
          </div>
          {/* right sectio : Orders table */}
          <div className="w-full md:w-2/3 lg:w-3/4">
          <MyOrdersPage/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
