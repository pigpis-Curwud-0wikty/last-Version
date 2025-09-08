import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ProductSearchForm from "../components/form/ProductSearchForm";

const ProductList = ({ token }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // search + pagination state
  const [searchParams, setSearchParams] = useState({
    searchTerm: "",
    subcategoryId: "",
    gender: "",
    fitType: "",
    minPrice: "",
    maxPrice: "",
    minSize: "",
    maxSize: "",
    inStock: false,
    onSale: false,
    sortBy: "price",
    sortDescending: true,
    color: "",
    size: "",
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
  });
  
  // Store subcategories fetched from API
  const [subcategories, setSubcategories] = useState([]);

  // Fit Types (static list)
  const fitTypes = [
    { id: 1, name: "Slim" },
    { id: 2, name: "Regular" },
    { id: 3, name: "Oversized" },
  ];
  
  // Common colors for filtering
  const colors = [
    { id: "black", name: "Black" },
    { id: "white", name: "White" },
    { id: "red", name: "Red" },
    { id: "blue", name: "Blue" },
    { id: "green", name: "Green" },
    { id: "yellow", name: "Yellow" },
    { id: "brown", name: "Brown" },
    { id: "gray", name: "Gray" },
    { id: "pink", name: "Pink" },
    { id: "purple", name: "Purple" },
  ];

  // Common sizes for filtering
  const sizes = [
    { id: "xs", name: "XS" },
    { id: "s", name: "S" },
    { id: "m", name: "M" },
    { id: "l", name: "L" },
    { id: "xl", name: "XL" },
    { id: "xxl", name: "XXL" },
  ];
  
  const [searchTerm, setSearchTerm] = useState("");

  // دوال مساعدة لتحويل الأرقام لنص
  const genderMap = {
    1: "male",
    2: "female",
  };

  const fitTypeMap = {
    1: "slim",
    2: "regular",
    3: "oversized",
  };

  // ✅ فلترة + ترتيب المنتجات
  const filteredProducts = [...products];
  
  // Only apply search term filtering if a search term exists
  if (searchTerm) {
    filteredProducts.sort((a, b) => {
      const search = searchTerm.toLowerCase();

      const formatProduct = (p) => {
        const gender = genderMap[p.gender] || "";
        const fitType = fitTypeMap[p.fitType] || "";
        return (
          p.id.toString() +
          " " +
          p.name.toLowerCase() +
          " " +
          p.description.toLowerCase() +
          " " +
          p.price.toString() +
          " " +
          gender.toLowerCase() +
          " " +
          fitType.toLowerCase()
        );
      };

      const aMatch = formatProduct(a).includes(search);
      const bMatch = formatProduct(b).includes(search);

      if (aMatch && !bMatch) return -1; // a في الأول
      if (!aMatch && bMatch) return 1; // b في الأول
      return 0; // بدون تغيير
    });
  }

  // fetch products with advanced search capabilities
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      // Clean and prepare parameters for API request
      const cleanParams = {
        ...Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== null && v !== "")
        ),
        page: params.page,
        pageSize: params.pageSize,
      };
      
      // Ensure numeric parameters are properly formatted
      if (cleanParams.subcategoryId) cleanParams.subcategoryId = Number(cleanParams.subcategoryId);
      if (cleanParams.gender) cleanParams.gender = Number(cleanParams.gender);
      if (cleanParams.fitType) cleanParams.fitType = Number(cleanParams.fitType);
      if (cleanParams.minPrice) cleanParams.minPrice = Number(cleanParams.minPrice);
      if (cleanParams.maxPrice) cleanParams.maxPrice = Number(cleanParams.maxPrice);
      if (cleanParams.minSize) cleanParams.minSize = Number(cleanParams.minSize);
      if (cleanParams.maxSize) cleanParams.maxSize = Number(cleanParams.maxSize);
      
      // Ensure boolean parameters are properly formatted
      cleanParams.inStock = cleanParams.inStock === true;
      cleanParams.onSale = cleanParams.onSale === true;
      
      // Make API request with advanced search parameters
      const response = await API.products.list(cleanParams, token);
      console.log("📥 Products API Response:", response);

      let items = response?.responseBody?.data || [];
      const total = response?.responseBody?.totalCount || items.length;

      // Handle deleted items based on includeDeleted parameter
      // This parameter is passed to the API, but we also filter the results here
      // to ensure consistency with the UI
      if (params.includeDeleted === false) {
        items = items.filter((p) => !p.isDeleted);
      }
      
      // Only filter by isActive if it's explicitly set
      if (params.isActive === true) {
        items = items.filter((p) => p.isActive === true);
      } else if (params.isActive === false) {
        items = items.filter((p) => p.isActive === false);
      }
      // If params.isActive is undefined, don't filter by active status

      // Set products and total count
      setProducts(items);
      setTotalCount(total);
    } catch (error) {
      console.error("❌ Error fetching products:", error);

      const serverMessage =
        error.response?.data?.responseBody?.message ||
        error.response?.data?.message ||
        error.message;

      if (error.response?.status === 404) {
        // 🟢 حالة مفيش منتجات
        toast.warning("⚠️ No products found matching the search criteria.");
        setProducts([]); // لازم نفرغ الجدول عشان يبان انه مفيش
        setTotalCount(0);
      } else {
        // 🔴 أي Error تاني
        toast.error(serverMessage || "❌ Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch all products on first load only - ensure we're not filtering by active status
    fetchProducts({
      // Explicitly set includeDeleted to false but don't filter by isActive
      includeDeleted: false
    });
    
    // Fetch subcategories
    const fetchSubcategories = async () => {
      try {
        const subs = await API.subcategories.getAll(token);
        setSubcategories(subs);
      } catch (err) {
        console.error("❌ Failed to fetch subcategories:", err);
        toast.error("Failed to load subcategories");
      }
    };

    fetchSubcategories();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Process search parameters
    const params = { ...searchParams };
    
    // Convert status to isActive parameter
    if (params.status) {
      if (params.status === 'active') {
        params.isActive = true;
        params.includeDeleted = false;
      } else if (params.status === 'inactive') {
        params.isActive = false;
        params.includeDeleted = false;
      } else if (params.status === 'deleted') {
        params.includeDeleted = true;
        // When showing deleted items, don't filter by active status
        delete params.isActive;
      }
      delete params.status;
    } else {
      // If no status is selected, don't filter by active status
      delete params.isActive;
      // Use the includeDeleted value from the form
      // If not explicitly set, default to false
      params.includeDeleted = params.includeDeleted === true;
    }
    
    // Process advanced search parameters
    // Convert string values to appropriate types for API
    if (params.subcategoryId) params.subcategoryId = Number(params.subcategoryId);
    if (params.gender) params.gender = Number(params.gender);
    if (params.fitType) params.fitType = Number(params.fitType);
    
    // Handle price ranges
    if (params.minPrice) params.minPrice = Number(params.minPrice);
    if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
    
    // Handle size ranges
    if (params.minSize) params.minSize = Number(params.minSize);
    if (params.maxSize) params.maxSize = Number(params.maxSize);
    
    // Ensure boolean values are properly formatted
    params.inStock = params.inStock === true;
    params.onSale = params.onSale === true;
    
    // Reset to page 1 for new searches
    params.page = 1;
    
    // Call the API with advanced search parameters
    fetchProducts(params);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle different input types appropriately
    let processedValue = value;

    if (type === "checkbox") {
      processedValue = checked;
    } else if (name === "sortDescending") {
      // Convert string "true"/"false" to actual boolean for select elements
      processedValue = value === "true";
    } else if (
      ["minPrice", "maxPrice", "minSize", "maxSize"].includes(name) &&
      value !== ""
    ) {
      // Convert numeric strings to numbers
      processedValue = Number(value);
    }

    setSearchParams((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // ✅ Pagination: يغير رقم الصفحة ويعمل Fetch
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    if (newPage > Math.ceil(totalCount / searchParams.pageSize)) return;

    const updatedParams = { ...searchParams, page: newPage };
    setSearchParams(updatedParams);
    fetchProducts(updatedParams);
    
    // Scroll to top of the table for better user experience
    window.scrollTo({
      top: document.querySelector('table').offsetTop - 100,
      behavior: 'smooth'
    });
  };
  
  // Handle changing the number of items per page
  const handlePageSizeChange = (newSize) => {
    const updatedParams = { ...searchParams, pageSize: newSize, page: 1 };
    setSearchParams(updatedParams);
    fetchProducts(updatedParams);
  };

  // ✅ fix: لازم نستقبل object كامل مش بس id
  const toggleProductStatus = async (product) => {
    try {
      const hasImage =
        (product.images && product.images.length > 0) || product.mainImage;

      if (!hasImage) {
        toast.error("Cannot activate product without an image");
        return;
      }

      if (product.isActive) {
        // ✅ Call deactivate API
        await API.products.deactivate(product.id, token);
        toast.success("Product deactivated successfully");
      } else {
        // ✅ Call activate API
        await API.products.activate(product.id, token);
        toast.success("Product activated successfully");
      }

      fetchProducts();
    } catch (error) {
      console.error("Error toggling product status:", error.response || error);
      toast.error("Failed to update product status");
    }
  };

  const handleRestoreProduct = async (id) => {
    try {
      await API.products.restore(id, token);
      toast.success("Product restored successfully");
      fetchProducts();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p))
      );
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error("Failed to restore product");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await API.products.delete(id, token);
      toast.success("Product deleted successfully");
      fetchProducts();

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Product Management</h2>

      {/* Search Form */}
      <ProductSearchForm
        searchParams={searchParams}
        handleInputChange={handleInputChange}
        handleSearch={handleSearch}
        subcategories={subcategories}
        fitTypes={fitTypes}
        colors={colors}
        sizes={sizes}
        loading={loading}
      />

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fit Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts
                // Sort products based on advanced search criteria
                .sort((a, b) => {
                  // Calculate match scores for each product
                  let aScore = 0;
                  let bScore = 0;
                  
                  // Match by search term
                  if (searchParams.searchTerm) {
                    const term = searchParams.searchTerm.toLowerCase();
                    
                    // Convert values to text for comparison
                    const aValues = [
                      a.name,
                      a.description,
                      a.price?.toString(),
                      a.isActive ? "active" : "inactive",
                      fitTypeMap[a.fitType] || a.fitType,
                    ]
                      .filter(Boolean)
                      .map((val) => val.toLowerCase());
                    
                    const bValues = [
                      b.name,
                      b.description,
                      b.price?.toString(),
                      b.isActive ? "active" : "inactive",
                      fitTypeMap[b.fitType] || b.fitType,
                    ]
                      .filter(Boolean)
                      .map((val) => val.toLowerCase());
                    
                    // Add score for search term matches
                    if (aValues.some((val) => val.includes(term))) aScore += 10;
                    if (bValues.some((val) => val.includes(term))) bScore += 10;
                  }
                  
                  // Match by subcategory
                  if (searchParams.subcategoryId) {
                    if (a.subcategoryId == searchParams.subcategoryId) aScore += 5;
                    if (b.subcategoryId == searchParams.subcategoryId) bScore += 5;
                  }
                  
                  // Match by gender
                  if (searchParams.gender) {
                    if (a.gender == searchParams.gender) aScore += 5;
                    if (b.gender == searchParams.gender) bScore += 5;
                  }
                  
                  // Match by fit type
                  if (searchParams.fitType) {
                    if (a.fitType == searchParams.fitType) aScore += 5;
                    if (b.fitType == searchParams.fitType) bScore += 5;
                  }
                  
                  // Match by price range
                  if (searchParams.minPrice || searchParams.maxPrice) {
                    const minPrice = searchParams.minPrice || 0;
                    const maxPrice = searchParams.maxPrice || Infinity;
                    
                    if (a.price >= minPrice && a.price <= maxPrice) aScore += 3;
                    if (b.price >= minPrice && b.price <= maxPrice) bScore += 3;
                  }
                  
                  // Match by color (check product variants)
                  if (searchParams.color && a.variants && b.variants) {
                    if (a.variants.some(v => v.color?.toLowerCase() === searchParams.color.toLowerCase())) aScore += 3;
                    if (b.variants.some(v => v.color?.toLowerCase() === searchParams.color.toLowerCase())) bScore += 3;
                  }
                  
                  // Match by size range
                  if ((searchParams.minSize || searchParams.maxSize) && a.variants && b.variants) {
                    const minSize = searchParams.minSize || 0;
                    const maxSize = searchParams.maxSize || Infinity;
                    
                    if (a.variants.some(v => v.size >= minSize && v.size <= maxSize)) aScore += 3;
                    if (b.variants.some(v => v.size >= minSize && v.size <= maxSize)) bScore += 3;
                  }
                  
                  // Match by specific size
                  if (searchParams.size && a.variants && b.variants) {
                    if (a.variants.some(v => v.size?.toString().toLowerCase() === searchParams.size.toLowerCase())) aScore += 3;
                    if (b.variants.some(v => v.size?.toString().toLowerCase() === searchParams.size.toLowerCase())) bScore += 3;
                  }
                  
                  // Match by stock status
                  if (searchParams.inStock) {
                    if (a.availableQuantity > 0) aScore += 2;
                    if (b.availableQuantity > 0) bScore += 2;
                  }
                  
                  // Match by sale status
                  if (searchParams.onSale) {
                    if (a.discountPercentage > 0) aScore += 2;
                    if (b.discountPercentage > 0) bScore += 2;
                  }
                  
                  // Return comparison result based on scores
                  return bScore - aScore; // Higher score first
                })

                .map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">{product.id}</td>

                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={
                            product.images.find((img) => img.isMain)?.url ||
                            product.images[0].url
                          }
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>

                    <td className="px-6 py-4">{product.name}</td>

                    <td className="px-6 py-4">
                      {product.description?.length > 50
                        ? `${product.description.substring(0, 50)}...`
                        : product.description}
                    </td>

                    <td className="px-6 py-4">${product.price}</td>

                    <td className="px-6 py-4">
                      {genderMap[product.gender] || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {fitTypeMap[product.fitType] || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {product.deletedAt ? (
                          // زر Restore بدل Delete
                          <button
                            onClick={() => handleRestoreProduct(product.id)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleProductStatus(product)}
                              className={`px-3 py-1 rounded text-xs ${
                                product.isActive
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {product.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => navigate(`/add?edit=${product.id}`)}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                            >
                              Update
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/products/${product.id}/variants`)
                              }
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              Variants
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/products/${product.id}/discount`)
                              }
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                            >
                              Discount
                            </button>
                          </>
                        )}
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
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 bg-white p-4 rounded shadow">
          {/* Left side - showing results info and items per page */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <div className="text-gray-600">
              Showing {(searchParams.page - 1) * searchParams.pageSize + 1} to{" "}
              {Math.min(searchParams.page * searchParams.pageSize, totalCount)} of{" "}
              {totalCount} results
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-gray-600">Items per page:</span>
              <select
                value={searchParams.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1 bg-white text-gray-700"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          {/* Right side - page controls */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handlePageChange(searchParams.page - 1)}
              disabled={searchParams.page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-600 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {/* Generate page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(totalCount / searchParams.pageSize)) }, (_, i) => {
                // Calculate which page numbers to show
                const totalPages = Math.ceil(totalCount / searchParams.pageSize);
                let pageNum;
                
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all pages
                  pageNum = i + 1;
                } else {
                  // If more than 5 pages, show pages around current page
                  const currentPage = searchParams.page;
                  if (currentPage <= 3) {
                    // Near start
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Near end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // In middle
                    pageNum = currentPage - 2 + i;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${searchParams.page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(searchParams.page + 1)}
              disabled={
                searchParams.page >=
                Math.ceil(totalCount / searchParams.pageSize)
              }
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-600 transition-colors duration-200 flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Total pages indicator */}
          <div className="text-gray-600 mt-2 md:mt-0 md:ml-4">
            Page {searchParams.page} of {Math.ceil(totalCount / searchParams.pageSize)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
