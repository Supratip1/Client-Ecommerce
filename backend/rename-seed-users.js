const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

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

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/rabbit-ecommerce";
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const customers = await User.find({ role: "customer" }).sort({ createdAt: 1 });
  console.log(`👤 Found ${customers.length} customer users to rename`);

  const updates = customers.map((u, idx) => {
    const { name, email } = generateUniqueNameEmail(idx + 1);
    u.name = name;
    // keep existing email if it's not a seed email
    if (/seed_user_|@example\.com$/i.test(u.email)) {
      u.email = email;
    }
    return u.save();
  });

  await Promise.all(updates);
  console.log("✅ Renamed customer users to realistic unique names");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ Rename failed:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


