
import React from "react";
import { HomepageContent } from "@/hooks/useHomepageContent";

interface CarouselImageItemProps {
  item: HomepageContent;
}

const CarouselImageItem: React.FC<CarouselImageItemProps> = ({ item }) => {
  return (
    <img
      src={item.url}
      alt={item.title || "Featured image"}
      className="w-full h-full object-cover bg-gray-200 transition-opacity"
      loading="lazy"
      style={{
        background: "linear-gradient(90deg,#e5e7eb,#f3f4f6)",
        objectFit: "cover",
      }}
    />
  );
};

export default CarouselImageItem;
