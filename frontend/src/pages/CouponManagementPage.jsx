import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaCopy, FaCalendarAlt, FaPercent, FaDollarSign } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const CouponManagementPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: null,
    validFrom: "",
    validUntil: "",
    usageLimit: null,
    applicableProducts: [],
    applicableCategories: [],
  });

  const getAuthToken = () => {
    return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/coupons`, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      setCoupons(response.data);
    } catch (error) {
      setError("Failed to fetch coupons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCoupon 
        ? `${API_BASE_URL}/api/coupons/${editingCoupon._id}`
        : `${API_BASE_URL}/api/coupons`;
      
      const method = editingCoupon ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      
      await fetchCoupons();
      resetForm();
    } catch (error) {
      setError("Failed to save coupon");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/coupons/${id}`, {
          headers: {
            Authorization: getAuthToken(),
          },
        });
        await fetchCoupons();
      } catch (error) {
        setError("Failed to delete coupon");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: null,
      validFrom: "",
      validUntil: "",
      usageLimit: null,
      applicableProducts: [],
      applicableCategories: [],
    });
    setShowAddForm(false);
    setEditingCoupon(null);
  };

  const handleEdit = (coupon) => {
    setFormData({
      ...coupon,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
    });
    setEditingCoupon(coupon);
    setShowAddForm(true);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Coupon code copied to clipboard!");
  };

  const isActive = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    return coupon.isActive && 
           now >= validFrom && 
           now <= validUntil && 
           (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Coupon Management</h1>
          <p className="text-gray-600">Create and manage discount coupons for your store</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          <FaPlus />
          <span>Add Coupon</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Purchase ($)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit || ""}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Coupons</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your discount coupons</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                        <button
                          onClick={() => copyCouponCode(coupon.code)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaCopy className="text-sm" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {coupon.discountType === 'percentage' ? (
                          <FaPercent className="text-green-600 mr-1" />
                        ) : (
                          <FaDollarSign className="text-green-600 mr-1" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {coupon.discountValue}
                          {coupon.discountType === 'percentage' ? '%' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.usageCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div>
                          <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">to {new Date(coupon.validUntil).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isActive(coupon)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive(coupon) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="inline-flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="inline-flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaPlus className="text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">No coupons created yet</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first coupon to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponManagementPage;
