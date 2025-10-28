const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedAtlasWithOriginal = async () => {
  await connectDB();

  try {
    // Clear existing products first
    console.log("Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products");

    // Ensure an admin user exists for product ownership
    let adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "123456", // In a real app, hash this password
        role: "admin",
      });
      console.log("✅ Created default admin user");
    } else {
      console.log("✅ Found existing admin user");
    }
    const adminUserId = adminUser._id;

    // Add all original products with admin user
    console.log("Adding original 40 products to MongoDB Atlas...");
    const productsWithUser = products.map(product => ({
      ...product,
      user: adminUserId
    }));

    await Product.insertMany(productsWithUser);
    console.log(`✅ Added ${products.length} original products to MongoDB Atlas`);

    // Verify the count
    const totalProducts = await Product.countDocuments();
    console.log(`✅ Total products in MongoDB Atlas: ${totalProducts}`);

    // Show sample products
    const sampleProducts = await Product.find().limit(3);
    console.log("\n📋 Sample products added:");
    sampleProducts.forEach(p => {
      console.log(`- ${p.name} (${p.category}) - Image: ${p.images[0]?.url}`);
    });

  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
};

seedAtlasWithOriginal();





