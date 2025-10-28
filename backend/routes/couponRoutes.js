const express = require("express");
const Coupon = require("../models/Coupon");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/coupons/validate/:code
// @desc    Validate a coupon code
// @access  Public
router.get("/validate/:code", async (req, res) => {
  try {
    const { totalAmount } = req.query;
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is no longer active" });
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ message: "Coupon is not valid at this time" });
    }

    // Check if minimum purchase is met
    if (totalAmount && coupon.minPurchase > parseFloat(totalAmount)) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.minPurchase} required` 
      });
    }

    // Check if usage limit is reached
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon has reached its usage limit" });
    }

    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update a coupon
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/coupons/:id/use
// @desc    Increment coupon usage count
// @access  Private
router.put("/:id/use", protect, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.usageCount += 1;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

