import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price, finalPrice }) => {
  const { currency } = useContext(ShopContext);
  const originalPrice = price || 0;
  const effectivePrice = typeof finalPrice === "number" ? finalPrice : originalPrice;
  const hasDiscount = effectivePrice < originalPrice;
  const discountPercentage = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;
  return (
    <>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="overflow-hidden relative">
          {hasDiscount && (
            <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide bg-black text-white px-2 py-1 rounded-full">
              Sale{discountPercentage ? ` ${discountPercentage}%` : ""}
            </span>
          )}
          <img
            className="hover:scale-110 transition ease-in-out"
            src={image[0]}
            alt=""
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        {hasDiscount ? (
          <div className="flex items-center gap-2">
            <span className="text-xs line-through text-gray-400">
              {currency}{originalPrice}
            </span>
            <span className="text-sm font-medium text-red-500">
              {currency}{effectivePrice}
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium">
            {currency}{originalPrice}
          </p>
        )}
      </Link>
    </>
  );
};

export default ProductItem;
