import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAdminProducts } from "../redux/slice/adminProductSlice";
import { fetchAllOrders } from "../redux/slice/adminOrderSlice";
import { FaDollarSign, FaShoppingBag, FaBoxOpen, FaArrowRight } from "react-icons/fa";

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);

  const {
    orders,
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {productsLoading || ordersLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : productsError ? (
        <p className="text-red-500">Error fetching products: {productsError}</p>
      ) : ordersError ? (
        <p className="text-red-500">Error fetching orders: {ordersError}</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <FaDollarSign className="text-2xl" />
                </div>
                <span className="text-sm opacity-90">Revenue</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">${totalSales.toFixed(2)}</h3>
              <p className="text-sm opacity-90">Total sales</p>
            </div>

            {/* Orders Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <FaShoppingBag className="text-2xl" />
                </div>
                <span className="text-sm opacity-90">Orders</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">{totalOrders}</h3>
              <Link to="/admin/orders" className="text-sm opacity-90 hover:underline flex items-center space-x-1">
                <span>Manage Orders</span>
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {/* Products Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <FaBoxOpen className="text-2xl" />
                </div>
                <span className="text-sm opacity-90">Products</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">{products.length}</h3>
              <Link to="/admin/products" className="text-sm opacity-90 hover:underline flex items-center space-x-1">
                <span>Manage Products</span>
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-gray-600 text-sm mt-1">Latest 10 orders from your store</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.user?.name || "Unknown User"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FaShoppingBag className="text-4xl text-gray-300 mb-3" />
                          <p className="text-gray-500 text-lg font-medium">No orders found</p>
                          <p className="text-gray-400 text-sm mt-1">Your orders will appear here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHomePage;
