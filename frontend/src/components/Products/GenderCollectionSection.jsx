import React from "react";
import mensCollectionImage from "../../assets/mens-collection.webp";
import womensCollectionImage from "../../assets/womens-collection.webp";
import { Link } from "react-router-dom";

const GenderCollectionSection = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto flex flex-col md:flex-row gap-8">
        {/* women collection */}
        <div className="relative flex-1 group cursor-pointer">
          <div className="overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 ease-out">
            <img
              src={womensCollectionImage}
              alt="womens collection"
              className="w-full h-[400px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
                Women Wear
              </h2>
              <Link
                to="/collections/all?gender=Women"
                className="bg-red-600 text-white hover:bg-red-700 duration-300 transition-all px-6 py-2 rounded-sm text-lg font-medium"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
        {/* mens collection */}
        <div className="relative flex-1 group cursor-pointer">
          <div className="overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 ease-out">
            <img
              src={mensCollectionImage}
              alt="mens collection"
              className="w-full h-[400px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase text-white mb-4">
                Men Wear
              </h2>
              <Link
                to="/collections/all?gender=Men"
                className="bg-red-600 text-white hover:bg-red-700 duration-300 transition-all px-6 py-2 rounded-sm text-lg font-medium"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenderCollectionSection;
