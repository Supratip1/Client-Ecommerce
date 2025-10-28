import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
  HiOutlineHeart,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CardDrawer from "../Layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);
  const location = useLocation();

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  // Show order success animation when on order confirmation page
  useEffect(() => {
    if (location.pathname === '/order-confirmation') {
      setShowOrderSuccess(true);
      // Hide the success animation after 3 seconds
      const timer = setTimeout(() => {
        setShowOrderSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCardDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* left - logo */}
        <div>
          <Link to="/" className="text-2xl font-medium">
            DesiStyle
          </Link>
        </div>
        {/* center - navigation links */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all?gender=Men"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Men
          </Link>
          <Link
            to="/collections/all?gender=Women"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Women
          </Link>
          <Link
            to="/collections/all?category=Top Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Top Wear
          </Link>
          <Link
            to="/collections/all?category=Bottom Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Bottom Wear
          </Link>
        </div>
        {/* right - icons */}
        <div className="flex items-center space-x-4">
          {/* Admin button hidden on mobile; available inside hamburger */}
          <div className="hidden md:block">
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="block bg-black px-4 py-2 rounded text-sm text-white hover:bg-gray-800 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          <Link to="/profile" className="hover:text-black">
            {user && user.avatar ? (
              <img 
                src={user.avatar.includes('googleusercontent.com') 
                  ? `${API_BASE_URL}/api/proxy/google-avatar/${encodeURIComponent(user.avatar)}`
                  : user.avatar
                } 
                alt={user.name} 
                className="h-6 w-6 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-6 w-6 rounded-full bg-gray-200 items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}
            >
              <span className="text-xs font-bold text-gray-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </Link>
          <button
            onClick={toggleCardDrawer}
            className="relative hover:text-black transition-all duration-300"
          >
            {showOrderSuccess ? (
              <div className="relative">
                <HiOutlineShoppingBag className="h-6 w-6 text-green-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                    {cartItemCount}
                  </span>
                )}
              </>
            )}
          </button>
          
          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative hover:text-black transition-all duration-300"
          >
            <HiOutlineHeart className="h-6 w-6 text-gray-700" />
            {wishlistProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistProducts.length}
              </span>
            )}
          </Link>
          {/* serach */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>
          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>
      <CardDrawer drawerOpen={drawerOpen} toggleCardDrawer={toggleCardDrawer} />

      {/* Mobile navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 h-full bg-white shadow-lg transform
        transition-transform duration-300 z-50 md:hidden sm:hidden ${
          navDrawerOpen ? "translate-x-0" : "translate-x-100"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">menu</h2>
          <nav className="space-y-4">
            <Link
              to="/collections/all?gender=Men"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Men
            </Link>
            <Link
              to="/collections/all?gender=Women"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Women
            </Link>
            <Link
              to="/collections/all?category=Top Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Top Wear
            </Link>
            <Link
              to="/collections/all?category=Bottom Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Bottom Wear
            </Link>
            {/* Admin within hamburger for mobile */}
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                onClick={toggleNavDrawer}
                className="block text-white bg-black px-4 py-2 rounded"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
