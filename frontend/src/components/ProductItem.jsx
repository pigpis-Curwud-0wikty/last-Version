import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  return (
    <>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="overflow-hidden">
          <img
            className="hover:scale-110 transition ease-in-out"
            src={image[0]}
            alt=""
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
    </>
  );
};

export default ProductItem;
