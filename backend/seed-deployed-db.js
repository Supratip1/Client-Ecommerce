const axios = require('axios');

const products = [
  {
    name: "Classic White T-Shirt",
    description: "A comfortable and stylish white t-shirt perfect for everyday wear",
    price: 24.99,
    discountPrice: 19.99,
    countInStock: 15,
    sku: "WHITE-TSHIRT-001",
    category: "Top Wear",
    brand: "DesiStyle",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    collections: "Summer",
    material: "Cotton",
    gender: "Men",
    images: [
      {
        url: "/images/white-tshirt.jpg",
        altText: "Classic White T-Shirt"
      }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["casual", "tshirt", "white"],
    rating: 4.8,
    numReviews: 25
  },
  {
    name: "Elegant Black Dress",
    description: "A sophisticated black dress perfect for formal occasions",
    price: 89.99,
    discountPrice: 69.99,
    countInStock: 8,
    sku: "BLACK-DRESS-001",
    category: "Dress",
    brand: "DesiStyle",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black"],
    collections: "Formal",
    material: "Polyester",
    gender: "Women",
    images: [
      {
        url: "/images/black-dress.jpg",
        altText: "Elegant Black Dress"
      }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["formal", "dress", "black"],
    rating: 4.9,
    numReviews: 18
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans with a comfortable fit",
    price: 59.99,
    discountPrice: 49.99,
    countInStock: 12,
    sku: "DENIM-JEANS-001",
    category: "Bottom Wear",
    brand: "DesiStyle",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue"],
    collections: "Casual",
    material: "Denim",
    gender: "Men",
    images: [
      {
        url: "/images/denim-jeans.jpg",
        altText: "Denim Jeans"
      }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["casual", "jeans", "denim"],
    rating: 4.6,
    numReviews: 32
  },
  {
    name: "Floral Summer Top",
    description: "Beautiful floral print top perfect for summer days",
    price: 34.99,
    discountPrice: 29.99,
    countInStock: 10,
    sku: "FLORAL-TOP-001",
    category: "Top Wear",
    brand: "DesiStyle",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Pink", "Blue"],
    collections: "Summer",
    material: "Cotton",
    gender: "Women",
    images: [
      {
        url: "/images/floral-top.jpg",
        altText: "Floral Summer Top"
      }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["summer", "floral", "top"],
    rating: 4.7,
    numReviews: 21
  }
];

const seedDeployedDB = async () => {
  try {
    console.log("Seeding deployed database...");
    
    for (const product of products) {
      try {
        const response = await axios.post('https://desistyle-api.vercel.app/api/products', product, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token' // This might not work, but let's try
          }
        });
        console.log(`✅ Added: ${product.name}`);
      } catch (error) {
        console.log(`❌ Failed to add ${product.name}:`, error.response?.status || error.message);
      }
    }
    
    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding deployed database:", error.message);
  }
};

seedDeployedDB();





