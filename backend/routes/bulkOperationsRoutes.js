const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   DELETE /api/admin/bulk/delete-products
// @desc    Delete multiple products
// @access  Private/Admin
router.delete("/delete-products", protect, admin, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Please provide product IDs" });
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({ 
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/bulk/update-products
// @desc    Update multiple products
// @access  Private/Admin
router.put("/update-products", protect, admin, async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Please provide product IDs" });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updates }
    );

    res.json({ 
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/bulk/publish-products
// @desc    Publish/unpublish multiple products
// @access  Private/Admin
router.put("/publish-products", protect, admin, async (req, res) => {
  try {
    const { productIds, isPublished } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Please provide product IDs" });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isPublished } }
    );

    res.json({ 
      message: `${result.modifiedCount} products ${isPublished ? 'published' : 'unpublished'} successfully`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

