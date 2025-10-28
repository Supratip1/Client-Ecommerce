import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { FaUpload, FaSpinner } from "react-icons/fa";

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPrice: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
    isFeatured: false,
    isPublished: true,
    tags: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProductData((prevData) => ({
        ...prevData,
        images: [...prevData.images, { url: data.imageUrl, altText: "" }],
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProductData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Add New Product</h2>
        <p className="text-gray-600">Create a new product for your store</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price * ($)
            </label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="countInStock"
              value={productData.countInStock}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Discount Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Discount Price ($)
          </label>
          <input
            type="number"
            name="discountPrice"
            value={productData.discountPrice}
            onChange={handleChange}
            step="0.01"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Images
          </label>
          <div className="flex items-center space-x-4 mb-4">
            <label className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
              <FaUpload />
              <span>Upload Image</span>
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </label>
            {uploading && (
              <div className="flex items-center space-x-2 text-purple-600">
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
          
          {/* Image Preview */}
          {productData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {productData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Adding Product...</span>
              </span>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;

