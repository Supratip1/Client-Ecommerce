const express = require("express");
const Wishlist = require("../models/Wishlist");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    await wishlist.populate("products");
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete("/:productId", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== req.params.productId
    );
    await wishlist.save();

    await wishlist.populate("products");
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

