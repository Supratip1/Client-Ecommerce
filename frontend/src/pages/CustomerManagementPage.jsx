import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/slice/adminSlice";
import { FaSearch, FaUser, FaEnvelope, FaCalendarAlt, FaShoppingBag } from "react-icons/fa";

const CustomerManagementPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading customers: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage your customer base and track customer activity</p>
        </div>
        <div className="text-sm text-gray-600">
          Total Customers: <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUser className="text-2xl text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Customers</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{users.length}</h3>
          <p className="text-sm text-gray-600">Registered users</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCalendarAlt className="text-2xl text-green-600" />
            </div>
            <span className="text-sm text-gray-500">New This Month</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {users.filter(user => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(user.createdAt) > monthAgo;
            }).length}
          </h3>
          <p className="text-sm text-gray-600">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaShoppingBag className="text-2xl text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Active Customers</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {users.filter(user => user.role === 'customer').length}
          </h3>
          <p className="text-sm text-gray-600">Regular customers</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaEnvelope className="text-2xl text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Email Verified</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {users.filter(user => user.email).length}
          </h3>
          <p className="text-sm text-gray-600">With email addresses</p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customer List</h2>
          <p className="text-gray-600 text-sm mt-1">Detailed view of all registered customers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaUser className="text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">
                        {searchTerm ? 'No customers found' : 'No customers available'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search' : 'Customers will appear here when they register'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {!searchTerm && (
        <div className="mt-6 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> customers
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;
