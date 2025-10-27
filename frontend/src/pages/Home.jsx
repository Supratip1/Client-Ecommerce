import React, { useEffect, useState } from "react";
import Hero from "../components/Layout/Hero.jsx";
import GenderCollectionSection from "../components/Products/GenderCollectionSection.jsx";
import NewArrivals from "../components/Products/NewArrivals.jsx";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import ProductGrid from "../components/Products/ProductGrid.jsx";
import ProductCarousel from "../components/Products/ProductCarousel.jsx";
import FeaturedCollection from "../components/Products/FeaturedCollection.jsx";
import FeaturesSection from "../components/Products/FeaturesSection.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slice/productsSlice.js";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  const [mensProducts, setMensProducts] = useState([]);
  const [mensLoading, setMensLoading] = useState(false);

  useEffect(() => {
    //fetch the product of specific collection
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      })
    );
    
    //fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    //fetch men's products
    const fetchMensProducts = async () => {
      setMensLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/products?gender=Men&category=Top Wear&limit=8`
        );
        setMensProducts(response.data);
      } catch (error) {
        console.error('Error fetching men products:', error);
      } finally {
        setMensLoading(false);
      }
    };
    
    fetchBestSeller();
    fetchMensProducts();
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      {/* Women's Top Wear */}
      <ProductCarousel 
        products={products} 
        loading={loading} 
        error={error}
        title="Top Wears for Women"
        description="Discover our curated collection of stylish and comfortable women's clothing that combines fashion with functionality."
      />

      {/* Men's Top Wear */}
      <ProductCarousel 
        products={mensProducts} 
        loading={mensLoading} 
        error={null}
        title="Top Wears for Men"
        description="Explore our premium collection of men's clothing designed for modern style and everyday comfort."
      />

      {/* best sellers */}
      <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Best Seller</h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover our most loved and highly-rated products that customers can't get enough of.
          </p>
        </div>
        {bestSellerProduct?._id ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center">Loading best seller products ...</p>
        )}
      </section>

      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
