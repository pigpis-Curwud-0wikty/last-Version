import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import ProductDiscountManager from "../components/product/ProductDiscountManager";

const ProductDiscountPage = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await API.products.list({}, token);
        setProducts(response.responseBody?.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Product Discount Management</h2>
      
      {/* Product Selection */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Select a Product</h3>
        
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available</p>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select a product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Product Discount Manager */}
      {selectedProductId && (
        <ProductDiscountManager productId={selectedProductId} token={token} />
      )}
    </div>
  );
};

export default ProductDiscountPage;