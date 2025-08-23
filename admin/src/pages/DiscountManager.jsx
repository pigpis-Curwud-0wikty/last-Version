import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';

const DiscountManager = ({ token }) => {
  // State for single product discount
  const [productId, setProductId] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  
  // State for bulk discount
  const [bulkDiscountId, setBulkDiscountId] = useState('');
  const [productsIds, setProductsIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // State for product list
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch products for selection
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.products.list({
        page: 1,
        pageSize: 100,
        isActive: true
      }, token);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [token]);
  
  // Handle single product discount creation
  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    if (!productId || !discountAmount) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setDiscountLoading(true);
    try {
      await API.discounts.create(productId, {
        discountAmount: Number(discountAmount)
      }, token);
      
      toast.success('Discount created successfully');
      setProductId('');
      setDiscountAmount('');
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('Failed to create discount');
    } finally {
      setDiscountLoading(false);
    }
  };
  
  // Handle bulk discount creation
  const handleCreateBulkDiscount = async (e) => {
    e.preventDefault();
    if (!bulkDiscountId || productsIds.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setBulkLoading(true);
    try {
      await API.bulkDiscounts.create({
        discountid: Number(bulkDiscountId),
        productsId: productsIds.map(id => Number(id))
      }, token);
      
      toast.success('Bulk discount created successfully');
      setBulkDiscountId('');
      setProductsIds([]);
    } catch (error) {
      console.error('Error creating bulk discount:', error);
      toast.error('Failed to create bulk discount');
    } finally {
      setBulkLoading(false);
    }
  };
  
  // Handle product selection for bulk discount
  const handleProductSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setProductsIds(selectedOptions);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Discount Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Product Discount */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-3">Create Product Discount</h3>
          <form onSubmit={handleCreateDiscount} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Discount Amount</label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="Enter discount amount"
                className="w-full px-3 py-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <button
              type="submit"
              disabled={discountLoading}
              className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {discountLoading ? 'Creating...' : 'Create Discount'}
            </button>
          </form>
        </div>
        
        {/* Bulk Discount */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-3">Create Bulk Discount</h3>
          <form onSubmit={handleCreateBulkDiscount} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount ID</label>
              <input
                type="number"
                value={bulkDiscountId}
                onChange={(e) => setBulkDiscountId(e.target.value)}
                placeholder="Enter discount ID"
                className="w-full px-3 py-2 border rounded"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Products</label>
              <select
                multiple
                value={productsIds}
                onChange={handleProductSelection}
                className="w-full px-3 py-2 border rounded h-40"
                required
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple products</p>
            </div>
            
            <button
              type="submit"
              disabled={bulkLoading}
              className="bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {bulkLoading ? 'Creating...' : 'Create Bulk Discount'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscountManager;