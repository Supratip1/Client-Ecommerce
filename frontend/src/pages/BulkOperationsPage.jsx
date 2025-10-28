import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts } from "../redux/slice/adminProductSlice";
import { FaCheck, FaTimes, FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BulkOperationsPage = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.adminProducts);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getAuthToken = () => {
    return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      setMessage("Please select products and an action");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let response;
      
      switch (bulkAction) {
        case "delete":
          response = await axios.delete(`${API_BASE_URL}/api/admin/bulk/delete-products`, {
            headers: { Authorization: getAuthToken() },
            data: { productIds: selectedProducts }
          });
          setMessage(`Successfully deleted ${response.data.deletedCount} products`);
          break;
          
        case "publish":
          response = await axios.put(`${API_BASE_URL}/api/admin/bulk/publish-products`, {
            productIds: selectedProducts,
            isPublished: true
          }, {
            headers: { Authorization: getAuthToken() }
          });
          setMessage(`Successfully published ${response.data.modifiedCount} products`);
          break;
          
        case "unpublish":
          response = await axios.put(`${API_BASE_URL}/api/admin/bulk/publish-products`, {
            productIds: selectedProducts,
            isPublished: false
          }, {
            headers: { Authorization: getAuthToken() }
          });
          setMessage(`Successfully unpublished ${response.data.modifiedCount} products`);
          break;
          
        default:
          setMessage("Invalid action selected");
          return;
      }

      // Refresh products list
      dispatch(fetchAdminProducts());
      setSelectedProducts([]);
      setBulkAction("");
      
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Perform actions on multiple products at once</p>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Actions</h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Action
            </label>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
            >
              <option value="">Choose an action...</option>
              <option value="publish">Publish Products</option>
              <option value="unpublish">Unpublish Products</option>
              <option value="delete">Delete Products</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleBulkAction}
              disabled={loading || !bulkAction || selectedProducts.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading || !bulkAction || selectedProducts.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? 'Processing...' : `Apply to ${selectedProducts.length} products`}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-600'
              : 'bg-green-50 border border-green-200 text-green-600'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-600 text-sm mt-1">
                Select products to perform bulk operations
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {selectedProducts.length} of {products.length} selected
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        product.countInStock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.countInStock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.countInStock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 10 ? 'Good' : product.countInStock > 0 ? 'Low' : 'Empty'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isPublished ? (
                          <>
                            <FaEye className="mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaCheck className="text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">No products available</p>
                      <p className="text-gray-400 text-sm mt-1">Add products to perform bulk operations</p>
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

export default BulkOperationsPage;
