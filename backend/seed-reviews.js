const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const Review = require("./models/Review");
const User = require("./models/User");

dotenv.config();

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/rabbit-ecommerce";
  await mongoose.connect(uri, {
    autoIndex: true,
  });
  console.log("✅ Connected to MongoDB");
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateComment(rating) {
  const positive = [
    "Excellent quality and fit!",
    "Super comfortable, would buy again.",
    "Exactly as described. Great value.",
    "Stylish and well-made.",
    "My new favorite!",
    "Impressive fabric and finish.",
    "Perfect for daily wear.",
  ];
  const neutral = [
    "Good overall, meets expectations.",
    "Decent quality for the price.",
    "Sizing is okay, material is fine.",
    "Looks good, feels average.",
  ];
  const negative = [
    "Not the quality I expected.",
    "Sizing runs a bit off for me.",
    "Material could be better.",
    "Color faded a little after wash.",
  ];

  if (rating >= 4) return randomFrom(positive);
  if (rating === 3) return randomFrom(neutral);
  return randomFrom(negative);
}

const FIRST_NAMES = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Krishna","Ishaan","Kabir","Rohan",
  "Anaya","Aadhya","Diya","Myra","Aarohi","Anika","Kiara","Ira","Saanvi","Zara",
  "Noah","Liam","Mason","Ethan","Logan","Lucas","Elijah","Oliver","Aiden","James",
  "Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia","Harper","Evelyn"
];
const LAST_NAMES = [
  "Sharma","Patel","Gupta","Mehta","Iyer","Jain","Khan","Singh","Das","Roy",
  "Smith","Johnson","Brown","Taylor","Lee","Wilson","Clark","Lewis","Hall","Young"
];

function generateUniqueNameEmail(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const num = index;
  const name = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${num}@example.com`;
  return { name, email };
}

async function ensureCustomerUsers(count) {
  const existing = await User.countDocuments({ role: "customer" });
  const needed = Math.max(0, count - existing);
  if (needed === 0) return;

  console.log(`👤 Creating ${needed} customer users for seeding...`);
  const docs = Array.from({ length: needed }).map((_, i) => {
    const { name, email } = generateUniqueNameEmail(existing + i + 1);
    return {
      name,
      email,
      password: "password123",
      role: "customer",
    };
  });
  await User.insertMany(docs, { ordered: false });
}

async function seedReviews() {
  await connectDB();

  // We will keep at least this many users available for random assignment
  await ensureCustomerUsers(120);

  let users = await User.find({ role: { $in: ["customer", "admin"] } }).select(
    "_id name"
  );
  let userIds = users.map((u) => u._id.toString());

  const products = await Product.find({});
  console.log(`📦 Found ${products.length} products. Seeding reviews...`);

  for (const product of products) {
    // Remove existing reviews for a clean slate
    await Review.deleteMany({ product: product._id });

    // Between 55 and 80 reviews to guarantee 50+ ratings
    let numReviews = Math.floor(Math.random() * 26) + 55; // 55..80

    // Ensure we have enough unique users
    if (numReviews > userIds.length) {
      await ensureCustomerUsers(numReviews + 20);
      users = await User.find({ role: { $in: ["customer", "admin"] } }).select("_id name");
      userIds = users.map((u) => u._id.toString());
    }

    // Shuffle user IDs and take the first numReviews to avoid duplicates per product
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    const reviewUserIds = shuffled.slice(0, numReviews);

    const reviewsToInsert = reviewUserIds.map((uid) => {
      const rating = Math.min(5, Math.max(1, Math.round(Math.random() * 2 + 3)));
      const comment = generateComment(rating);
      return {
        product: product._id,
        user: uid,
        rating,
        comment,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 120)
        ),
        updatedAt: new Date(),
      };
    });

    await Review.insertMany(reviewsToInsert);

    // Recompute average rating and numReviews for the product
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = agg[0]?.avgRating || 0;
    const count = agg[0]?.count || 0;

    product.rating = Number(avgRating.toFixed(2));
    product.numReviews = count;
    await product.save();

    console.log(
      `📝 Seeded ${count} reviews for "${product.name}" (avg: ${product.rating})`
    );
  }

  console.log("✅ Review seeding completed.");
  await mongoose.disconnect();
  process.exit(0);
}

seedReviews().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});


