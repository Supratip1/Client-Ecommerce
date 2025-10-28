import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slice/adminOrderSlice";
import { FaSearch, FaEye } from "react-icons/fa";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.adminOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, user, navigate]);

  const handleStatus = (orderId, status) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h2>
        <p className="text-gray-600">Track and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors font-medium"
        >
          <option value="all">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-500">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order._id.slice(-8)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.orderItems?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatus(order._id, e.target.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border-2 focus:outline-none ${getStatusColor(order.status)}`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        to={`/order/${order._id}`}
                        className="inline-flex items-center space-x-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                      >
                        <FaEye />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaSearch className="text-5xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
      </div>
    </div>
  );
};

export default OrderManagement;
