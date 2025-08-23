import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';

const ProductList = ({ token }) => {
  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for search and filters
  const [searchParams, setSearchParams] = useState({
    name: '',
    description: '',
    page: 1,
    pageSize: 10,
    isActive: true,
    includeDeleted: false
  });

  // Fetch products with current search parameters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.products.list(searchParams, token);
      setProducts(response.data || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount and when search params change
  useEffect(() => {
    fetchProducts();
  }, [searchParams.page, searchParams.pageSize, token]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setSearchParams(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  // Handle input changes for search fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  // Handle product activation/deactivation
  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      if (currentStatus) {
        await API.products.deactivate(productId, token);
        toast.success('Product deactivated successfully');
      } else {
        await API.products.activate(productId, token);
        toast.success('Product activated successfully');
      }
      // Refresh the product list
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.products.delete(productId, token);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Product Management</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={searchParams.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={searchParams.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by description"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={searchParams.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm">Active Products Only</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDeleted"
              name="includeDeleted"
              checked={searchParams.includeDeleted}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="includeDeleted" className="text-sm">Include Deleted</label>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSearchParams({
                name: '',
                description: '',
                page: 1,
                pageSize: 10,
                isActive: true,
                includeDeleted: false
              });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>
      
      {/* Products Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">No products found</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4">
                    {product.description.length > 50 
                      ? `${product.description.substring(0, 50)}...` 
                      : product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.isActive)}
                        className={`px-3 py-1 rounded text-xs ${product.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {(searchParams.page - 1) * searchParams.pageSize + 1} to {Math.min(searchParams.page * searchParams.pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(searchParams.page - 1)}
              disabled={searchParams.page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {searchParams.page} of {Math.ceil(totalCount / searchParams.pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(searchParams.page + 1)}
              disabled={searchParams.page >= Math.ceil(totalCount / searchParams.pageSize)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;