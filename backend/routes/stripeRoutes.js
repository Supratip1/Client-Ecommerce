const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Debug logging
    console.log('User data:', {
      id: user._id,
      idType: typeof user._id,
      email: user.email,
      name: user.name
    });

    // Convert amount to smallest currency unit (cents for USD, paise for INR)
    const amountInSmallestUnit = Math.round(Number(amount) * 100);

    // Ensure all metadata values are strings with additional validation
    const metadata = {
      userId: user._id ? user._id.toString() : '',
      userEmail: user.email ? String(user.email) : '',
      userName: user.name ? String(user.name) : '',
      orderId: `temp_${Date.now()}`
    };

    // Debug metadata
    console.log('Metadata being sent:', metadata);
    console.log('Metadata types:', {
      userId: typeof metadata.userId,
      userEmail: typeof metadata.userEmail,
      userName: typeof metadata.userName,
      orderId: typeof metadata.orderId
    });

    // Create payment intent with proper metadata (all values must be strings)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Enhanced logging for debugging
    console.log('Payment Intent created successfully:', {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      livemode: paymentIntent.livemode,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      livemode: paymentIntent.livemode,
      amount: paymentIntent.amount
    });

  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    });
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

// Confirm payment and create order
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    // Debug: Log the request body (sanitized)
    console.log('confirm-payment body received:', {
      paymentIntentId: req.body.paymentIntentId ? 'pi_***' : 'NOT_SET',
      hasItems: !!req.body.items,
      hasShippingAddress: !!req.body.shippingAddress,
      totalPrice: req.body.totalPrice
    });
    
    const { paymentIntentId, shippingAddress, items } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Payment intent ID required',
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Retrieved PaymentIntent:', {
      id: paymentIntent.id ? 'pi_***' : 'NOT_SET',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method_types: paymentIntent.payment_method_types
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not successful',
        message: 'Payment was not successful'
      });
    }

    // Check if order already exists for this PaymentIntent to prevent duplicates
    const existingOrder = await Order.findOne({ paymentIntentId: paymentIntentId });
    if (existingOrder) {
      console.log('Order already exists for PaymentIntent:', paymentIntentId ? 'pi_***' : 'NOT_SET');
      return res.json({
        success: true,
        orderId: existingOrder._id,
        message: 'Order already exists for this payment',
        duplicate: true
      });
    }

    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Derive required fields FROM THE PAYMENT INTENT (server-side)
    const totalPrice = Number((paymentIntent.amount / 100).toFixed(2)); // Convert cents to dollars
    const paymentMethod = paymentIntent.payment_method_types?.[0] || 'card';

    console.log('Derived fields from PaymentIntent:', {
      totalPrice,
      totalPriceType: typeof totalPrice,
      paymentMethod,
      paymentMethodType: typeof paymentMethod,
      currency: paymentIntent.currency
    });

    // Verify values are present
    if (!totalPrice || totalPrice === 0) {
      console.error('totalPrice is missing or zero!');
      return res.status(400).json({
        error: 'Invalid total price',
        message: 'Total price cannot be zero'
      });
    }

    if (!paymentMethod) {
      console.error('paymentMethod is missing!');
      return res.status(400).json({
        error: 'Invalid payment method',
        message: 'Payment method is required'
      });
    }

    // Optional: Verify against items total (for security)
    if (items && items.length > 0) {
      const computedTotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      if (Math.abs(computedTotal - totalPrice) > 0.01) {
        console.warn('Amount mismatch detected:', {
          computedFromItems: computedTotal,
          stripeAmount: totalPrice,
          paymentIntentId
        });
      }
    }

    // Handle shipping address - provide fallbacks if undefined
    const safeShippingAddress = shippingAddress || {};
    
    // Validate shipping address required fields
    if (!safeShippingAddress.address || !safeShippingAddress.city || 
        !safeShippingAddress.postalCode || !safeShippingAddress.country) {
      console.error('Missing shipping address fields:', safeShippingAddress);
      return res.status(400).json({
        error: 'Invalid shipping address',
        message: 'Complete shipping address is required (address, city, postalCode, country)'
      });
    }

    // Transform items to match Order schema requirements
    const orderItems = (items || []).map(item => {
      console.log('Processing item:', item);
      return {
        productId: item.productId || item._id,
        name: item.name || 'Unknown Product',
        image: item.image || '',
        price: item.price || 0,
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity || 1
      };
    });

    console.log('Transformed orderItems:', orderItems);

    // Prepare order data with explicit field assignment
    const orderData = {
      user: user._id,
      orderItems: orderItems,
      totalPrice: totalPrice,               // Explicitly assign
      paymentMethod: paymentMethod,         // Explicitly assign
      shippingAddress: {
        address: safeShippingAddress.address,
        city: safeShippingAddress.city,
        postalCode: safeShippingAddress.postalCode,
        country: safeShippingAddress.country
      },
      paymentStatus: 'completed',
      status: 'Processing',
      isPaid: true,
      paidAt: new Date(),
      paymentIntentId: paymentIntentId  // Track PaymentIntent to prevent duplicates
    };

    console.log('Creating order with full data:', JSON.stringify(orderData, null, 2));

    // Create order with all required fields derived from Stripe
    const order = new Order(orderData);

    await order.save();

    // Clear user's cart
    await Cart.deleteMany({ user: user._id });

    res.json({
      success: true,
      orderId: order._id,
      message: 'Payment confirmed and order created successfully'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
});

// Get test configuration (for development)
router.get('/test-keys', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Not configured',
    secretKey: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
    environment: 'test'
  });
});

// Temporary diagnostics route to verify Stripe account
router.get('/whoami', async (_req, res) => {
  try {
    const account = await stripe.accounts.retrieve();
    res.json({ 
      account: account.id, 
      livemode: account.charges_enabled,
      country: account.country,
      email: account.email,
      type: account.type
    });
  } catch (error) {
    console.error('Stripe account retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve Stripe account',
      message: error.message
    });
  }
});

// Test route to verify Order model
router.post('/test-order', async (req, res) => {
  try {
    console.log('Test order body:', req.body);
    
    const testOrder = new Order({
      user: req.body.userId || '507f1f77bcf86cd799439011', // dummy ObjectId
      orderItems: [{
        productId: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        image: 'test.jpg',
        price: 10.99,
        quantity: 1
      }],
      totalPrice: 10.99,
      paymentMethod: 'card',
      shippingAddress: {
        address: 'Test Address',
        city: 'Test City',
        postalCode: '12345',
        country: 'US'
      },
      paymentStatus: 'completed',
      status: 'Processing',
      isPaid: true,
      paidAt: new Date()
    });

    console.log('Test order created successfully:', testOrder);
    res.json({ success: true, message: 'Order model test passed' });
  } catch (error) {
    console.error('Order model test failed:', error);
    res.status(500).json({
      error: 'Order model test failed',
      message: error.message,
      details: error.errors
    });
  }
});

module.exports = router;