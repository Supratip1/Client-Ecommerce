import React from "react";

const SkeletonCard = () => {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-sm">
      <div className="w-full aspect-[3/4] bg-gray-200 rounded-t-xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
};

export default SkeletonCard;


