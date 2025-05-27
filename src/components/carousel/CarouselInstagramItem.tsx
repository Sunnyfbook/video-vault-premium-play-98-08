
import React from "react";
import { HomepageContent } from "@/hooks/useHomepageContent";
import InstagramEmbed from "@/components/InstagramEmbed";

interface CarouselInstagramItemProps {
  item: HomepageContent;
}

const CarouselInstagramItem: React.FC<CarouselInstagramItemProps> = ({ item }) => (
  <InstagramEmbed
    url={item.url}
    title={item.title || "Instagram content"}
    className="w-full h-full"
  />
);

export default CarouselInstagramItem;
