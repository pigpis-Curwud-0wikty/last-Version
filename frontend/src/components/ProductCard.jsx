import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const ProductCard = ({ product }) => {
  const { currency, addToCart } = useContext(ShopContext);

  // Handle missing product data gracefully
  if (!product) {
    return null;
  }

  // Get main image or placeholder
  const mainImage = product.images && product.images.length > 0 
    ? product.images.find(img => img.isMain)?.url || product.images[0].url 
    : 'https://via.placeholder.com/300x400';

  // Format price
  const price = product.price || 0;
  const finalPrice = product.finalPrice || price;
  const hasDiscount = finalPrice < price;

  return (
    <div className="group relative overflow-hidden rounded-lg transition-all hover:shadow-lg">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
          {Math.round(((price - finalPrice) / price) * 100)}% OFF
        </div>
      )}
      
      {/* Product image with hover effect */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <div className="relative h-100 overflow-hidden">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Product details */}
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 h-8">{product.description}</p>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-900">{currency}{finalPrice}</span>
                <span className="text-xs text-gray-500 line-through">{currency}{price}</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900">{currency}{price}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;