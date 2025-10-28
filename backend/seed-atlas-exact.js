const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

const seedAtlasWithExactData = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    // Clear existing products in Atlas
    console.log("Clearing existing products...");
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Create or find admin user
    let adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "123456",
        role: "admin",
      });
      console.log("Created admin user");
    } else {
      console.log("Found existing admin user");
    }

    // Add the exact 40 products from products.js
    console.log("Adding exact 40 products from products.js...");
    const productsWithUser = products.map((product) => ({
      ...product,
      user: adminUser._id,
    }));

    await Product.insertMany(productsWithUser);
    console.log("✅ Successfully added all 40 exact products to Atlas!");

    // Verify
    const count = await Product.countDocuments();
    console.log(`Total products in Atlas database: ${count}`);

    const sample = await Product.find().limit(5);
    console.log("Sample products in Atlas:");
    sample.forEach(p => {
      console.log(`- ${p.name} (${p.category}, ${p.gender}) - $${p.price}`);
      console.log(`  Image: ${p.images[0]?.url}`);
    });

  } catch (error) {
    console.error("Error seeding Atlas database:", error);
  } finally {
    mongoose.connection.close();
    console.log("Connection closed");
  }
};

seedAtlasWithExactData();





