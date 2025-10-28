import React, { useRef, useState } from "react";

const ImageMagnifier = ({ src, alt = "", className = "", zoom = 2, rounded = "rounded-lg" }) => {
  const containerRef = useRef(null);
  const [isHover, setIsHover] = useState(false);
  const [bgPosition, setBgPosition] = useState("center");

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPosition(`${x}% ${y}%`);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onMouseMove={handleMove}
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: isHover ? bgPosition : "center",
        backgroundSize: isHover ? `${zoom * 100}%` : "cover",
        transition: "background-size 200ms ease-out",
      }}
      aria-label={alt}
      role="img"
    >
      {/* Fallback <img> for SEO/alt text while using background for zoom */}
      <img src={src} alt={alt} className={`opacity-0 w-full h-full object-cover ${rounded}`} />
    </div>
  );
};

export default ImageMagnifier;


