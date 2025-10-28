import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct, fetchAdminProducts } from "../../redux/slice/adminProductSlice";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaImage } from "react-icons/fa";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state) => state.adminProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch(deleteProduct(id));
    }
  };

  if(loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if(error) return <p className="text-red-500">Error: {error}</p>
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Search and Add Button */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Product Management</h2>
          <p className="text-gray-600">Manage all your products in one place</p>
        </div>
        <Link
          to="/admin/products/add"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
        >
          <FaPlus />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-500">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
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
                            <FaImage className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.brand || 'No brand'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">${product.price}</div>
                      {product.discountPrice && (
                        <div className="text-xs text-green-600">Discounted: ${product.discountPrice}</div>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaImage className="text-5xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {searchTerm ? 'No products found' : 'No products available'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}
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
          Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
