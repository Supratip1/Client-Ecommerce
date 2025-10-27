import React from "react";
import heroImg from "../../assets/rabbit-hero.webp";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative">
      <img
        src={heroImg}
        alt="Rabbit"
        className="w-full h-auto md:h-[600px] lg:h-[750px] object-contain md:object-cover object-center rounded-2xl shadow-2xl"
      />
      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-9xl font-bold tracking-tighter uppercase mb-4">
            Vacation <br />Ready
          </h1>
          <Link to="/collections/all" className="bg-red-600 text-white hover:bg-red-700 hover:text-white duration-300 transition-all px-6 py-2 rounded-sm text-lg font-medium">
          Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
