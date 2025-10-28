import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalyticsOverview, fetchProductAnalytics } from "../redux/slice/analyticsSlice";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaChartLine,
  FaDollarSign,
  FaShoppingBag,
  FaUsers,
  FaBox,
  FaStar,
  FaExclamationTriangle,
} from "react-icons/fa";

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { overview, productAnalytics, loading, error } = useSelector((state) => state.analytics);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    dispatch(fetchAnalyticsOverview(selectedPeriod));
    dispatch(fetchProductAnalytics());
  }, [dispatch, selectedPeriod]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
        <p className="text-red-600">Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your store performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaDollarSign className="text-2xl text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Revenue</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ${overview.revenue.total.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                Avg: ${overview.revenue.averageOrderValue.toFixed(2)} per order
              </p>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaShoppingBag className="text-2xl text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Orders</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {overview.orders.total}
              </h3>
              <p className="text-sm text-gray-600">
                Last {selectedPeriod} days
              </p>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Customers</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {overview.users.total}
              </h3>
              <p className="text-sm text-gray-600">
                +{overview.users.new} new
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FaChartLine className="text-2xl text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Conversion</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {overview.conversionRate}%
              </h3>
              <p className="text-sm text-gray-600">
                Users to buyers
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={overview.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Product Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Products</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overview.bestSellingProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product.name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalSold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Inventory Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-lg mb-2">
                  <FaBox className="text-3xl text-green-600 mx-auto" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">{overview.products.total}</h4>
                <p className="text-gray-600">Total Products</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-4 rounded-lg mb-2">
                  <FaExclamationTriangle className="text-3xl text-yellow-600 mx-auto" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">{overview.products.lowStock}</h4>
                <p className="text-gray-600">Low Stock</p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 p-4 rounded-lg mb-2">
                  <FaExclamationTriangle className="text-3xl text-red-600 mx-auto" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">{overview.products.outOfStock}</h4>
                <p className="text-gray-600">Out of Stock</p>
              </div>
            </div>
          </div>

          {/* Product Analytics Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Product Performance</h3>
              <p className="text-gray-600 text-sm mt-1">Detailed analytics for all products</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productAnalytics.slice(0, 10).map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.images[0]?.url || '/placeholder.jpg'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.countInStock > 10 
                            ? 'bg-green-100 text-green-800'
                            : product.countInStock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.countInStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.totalSold || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(product.revenue || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({product.numReviews})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
