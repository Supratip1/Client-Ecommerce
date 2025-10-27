const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/rabbit-ecommerce");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Function to seed Data
const seedData = async () => {
  try {
    await connectDB();
    
    console.log("🧹 Clearing existing data...");
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    console.log("✅ Cleared existing data");

    // Create a default admin user
    console.log("👤 Creating admin user...");
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    });
    console.log("✅ Admin user created");

    // Assign the default user ID to each product
    const userID = createdUser._id;

    console.log(`📦 Seeding ${products.length} products...`);
    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    // Insert the products into the database
    await Product.insertMany(sampleProducts);

    console.log(`✅ Successfully seeded ${products.length} products!`);
    
    // Verify the seeding
    const productCount = await Product.countDocuments();
    console.log(`📊 Total products in database: ${productCount}`);
    
    // Show sample of seeded products
    const sampleSeededProducts = await Product.find().limit(5);
    console.log("\n📋 Sample of seeded products:");
    sampleSeededProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category}, ${product.gender}) - $${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding the data:", error);
    process.exit(1);
  }
};

seedData();
