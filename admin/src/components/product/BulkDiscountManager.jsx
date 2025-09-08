import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";

const BulkDiscountManager = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products and discounts
  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true);
      try {
        // Get products
        const productsResponse = await API.products.list({}, token);
        setProducts(productsResponse.responseBody?.data || []);
        
        // Get available discounts
        const discountsResponse = await API.discounts.list({}, token);
        setAvailableDiscounts(discountsResponse.responseBody?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle product selection
  const handleProductSelection = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      // If all are selected, deselect all
      setSelectedProductIds([]);
    } else {
      // Otherwise, select all
      setSelectedProductIds(products.map(product => product.id));
    }
  };

  // Apply discount to selected products
  const handleApplyBulkDiscount = async () => {
    if (selectedDiscountId === null) {
      toast.error("Please select a discount");
      return;
    }

    if (selectedProductIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setLoading(true);
    try {
      await API.discounts.applyBulkDiscount(selectedDiscountId, selectedProductIds, token);
      toast.success(`Discount applied to ${selectedProductIds.length} products successfully`);
      
      // Reset selection
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Error applying bulk discount:", error);
      const msg = error.response?.data?.responseBody?.message || error.response?.data?.message || error.message || "Failed to apply discount";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-medium mb-4">Associate Products with Discount</h3>
      <p className="mb-4 text-gray-600">Select products to apply this discount to. Products must be associated for the discount calculation to work.</p>
      
      {/* Discount Selection */}
      <div className="mb-6 p-4 border rounded">
        <h4 className="text-md font-medium mb-2">Select Discount</h4>
        
        {availableDiscounts.length === 0 ? (
          <p>No discounts available. Create discounts first.</p>
        ) : (
          <div>
            <div className="mb-4">
              <select
                value={selectedDiscountId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDiscountId(val === "" ? null : Number(val));
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select a discount --</option>
                {availableDiscounts.map((discount) => (
                  <option key={discount.id} value={discount.id}>
                    {discount.name} ({discount.discountPercent}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Product Selection */}
      <div className="mb-6 p-4 border rounded">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium">Select Products</h4>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {selectedProductIds.length === products.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto border rounded">
            {products.map((product) => (
              <div 
                key={product.id} 
                className={`flex items-center p-3 border-b ${selectedProductIds.includes(product.id) ? 'bg-blue-50' : ''}`}
              >
                <input
                  type="checkbox"
                  id={`product-${product.id}`}
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => handleProductSelection(product.id)}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor={`product-${product.id}`} className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                    {product.images && product.images.length > 0 && (
                      <img 
                        src={product.images.find(img => img.isMain)?.url || product.images[0].url} 
                        alt={product.name}
                        className="w-12 h-12 object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">${product.price}</p>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">{selectedProductIds.length} products selected</p>
        </div>
      </div>
      
      {/* Apply Button */}
      <div className="flex justify-end">
        <button
          onClick={handleApplyBulkDiscount}
          disabled={selectedDiscountId === null || selectedProductIds.length === 0 || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Applying..." : "Associate Selected Products"}
        </button>
      </div>
    </div>
  );
};

export default BulkDiscountManager;