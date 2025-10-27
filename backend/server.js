const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path");
const session = require("express-session");
const passport = require("passport");

// Load environment variables first
dotenv.config();

console.log('\n🚀 Starting Server...');
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'EXISTS' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : '❌ MISSING');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET (using localhost:3000)');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET (using localhost:5173)');
console.log('============================\n');

// Import passport configuration
require("./config/passport");

const connectDB = require("./config/db")
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes")
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoute = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const authRoutes = require("./routes/authRoutes");
const imageProxyRoutes = require("./routes/imageProxy");

const app = express();
app.use(express.json());

// Session configuration for Passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const allowedOrigins = [
  'http://localhost:5173',
  'https://client-ecommerce-drab.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

console.log('✅ CORS enabled for origins:', allowedOrigins);

// Serve static files from the frontend public directory and backend images directory
// Serve from frontend public directories (for women's clothing in /image folder)
app.use('/image', express.static(path.join(__dirname, '../frontend/public/image')));
// Serve from frontend public images directory (for men's clothing)
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
// Also serve from backend images directory as fallback
app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 3000;

//connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to Rabbit")
})

// Add logging middleware for all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

//API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscribeRoute);
app.use("/api/stripe", stripeRoutes);
app.use("/api/proxy", imageProxyRoutes);

//Admin
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})