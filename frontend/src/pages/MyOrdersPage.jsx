import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../redux/slice/orderSlice";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error : {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
      
      {/* Mobile view - Card layout */}
      <div className="block md:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => handleRowClick(order._id)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start gap-3">
                <img
                  src={order.orderItems[0].image}
                  alt={order.orderItems[0].name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-gray-500 truncate">
                      #{order._id.substring(order._id.length - 8)}
                    </p>
                    <span
                      className={`${
                        order.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      } px-2 py-1 rounded text-xs whitespace-nowrap ml-2`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} • ${order.totalPrice}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            You have no orders
          </div>
        )}
      </div>

      {/* Desktop view - Table layout */}
      <div className="hidden md:block relative shadow-md sm:rounded-lg overflow-hidden">
        <table className="min-w-full text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 text-left">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Shipping Address</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b hover:border-gray-500 cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].image}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order._id.substring(order._id.length - 8)}
                  </td>
                  <td className="py-4 px-4">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-4 px-4">
                    {order.shippingAddress
                      ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                      : "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    {order.orderItems.length}
                  </td>
                  <td className="py-4 px-4">
                    ${order.totalPrice}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`${
                        order.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      } px-2 py-1 rounded-lg text-sm`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                  You have no orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrdersPage;
