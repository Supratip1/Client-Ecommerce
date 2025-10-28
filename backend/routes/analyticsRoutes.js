const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/analytics/overview
// @desc    Get analytics overview
// @access  Private/Admin
router.get("/overview", protect, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get sales data
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get products data
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ countInStock: 0 });
    const lowStockProducts = await Product.countDocuments({ 
      countInStock: { $gt: 0, $lt: 10 } 
    });

    // Get users data
    const totalUsers = await User.countDocuments({ role: "customer" });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
      role: "customer",
    });

    // Get reviews data
    const totalReviews = await Review.countDocuments();

    // Get conversion rate (percentage of users who made a purchase)
    const usersWithOrders = await Order.distinct("user");
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const conversionRate = totalCustomers > 0 
      ? ((usersWithOrders.length / totalCustomers) * 100).toFixed(2)
      : 0;

    // Get best selling products
    const bestSellingProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Populate product details
    for (let item of bestSellingProducts) {
      const product = await Product.findById(item._id);
      item.product = product;
    }

    // Get sales by day for the period
    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      revenue: {
        total: totalRevenue,
        averageOrderValue,
        period: `${days} days`,
      },
      orders: {
        total: totalOrders,
        period: `${days} days`,
      },
      products: {
        total: totalProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockProducts,
      },
      users: {
        total: totalUsers,
        new: newUsers,
        period: `${days} days`,
      },
      reviews: {
        total: totalReviews,
      },
      conversionRate: parseFloat(conversionRate),
      bestSellingProducts,
      salesByDay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/admin/analytics/products
// @desc    Get product analytics
// @access  Private/Admin
router.get("/products", protect, admin, async (req, res) => {
  try {
    const products = await Product.find();
    const withSalesData = await Promise.all(
      products.map(async (product) => {
        const salesData = await Order.aggregate([
          { $unwind: "$orderItems" },
          { $match: { "orderItems.productId": product._id } },
          {
            $group: {
              _id: null,
              totalSold: { $sum: "$orderItems.quantity" },
              revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
            },
          },
        ]);

        return {
          ...product.toObject(),
          totalSold: salesData[0]?.totalSold || 0,
          revenue: salesData[0]?.revenue || 0,
        };
      })
    );

    res.json(withSalesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

