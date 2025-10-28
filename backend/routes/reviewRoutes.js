const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const userId = req.user._id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images,
      isVerifiedPurchase: false, // TODO: Check if user purchased this product
    });

    // Update product rating
    const product = await Product.findById(productId);
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    product.rating = avgRating;
    product.numReviews = reviews.length;
    await product.save();

    await review.populate("user", "name avatar");
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get("/:productId", async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId })
        .populate("user", "name avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: req.params.productId })
    ]);

    res.json({ reviews, page, pages: Math.ceil(total / limit), total, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    review.images = req.body.images || review.images;
    
    await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    product.rating = avgRating;
    await product.save();

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product;
    await review.remove();

    // Update product rating
    const product = await Product.findById(productId);
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      product.rating = 0;
      product.numReviews = 0;
    } else {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.rating = avgRating;
      product.numReviews = reviews.length;
    }
    
    await product.save();

    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

