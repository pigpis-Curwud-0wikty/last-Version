import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";

const Collection = () => {
  const { t } = useTranslation();
  const { products, search, backendUrl } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);

  // States for filtering
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedFitTypes, setSelectedFitTypes] = useState([]);

  // New filter states
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  // States for filter options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [fitTypes, setFitTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOption, setSortOption] = useState("relavent");

  // Debug: Log products when they change
  useEffect(() => {
    console.log("Products from context:", products);
    console.log("Number of products:", products?.length || 0);
  }, [products]);

  // Debug: Log search term when it changes
  useEffect(() => {
    console.log("Search term:", search);
  }, [search]);

  // Fetch filter options from backend
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch categories
        const categoriesResponse = await axios.get(
          `${backendUrl}/api/categories?isActive=true&includeDeleted=false`
        );
        if (categoriesResponse.data.responseBody) {
          setCategories(categoriesResponse.data.responseBody.data || []);
        }

        // Fetch subcategories
        const subCategoriesResponse = await axios.get(
          `${backendUrl}/api/subcategories?isActive=true&includeDeleted=false`
        );
        if (subCategoriesResponse.data.responseBody) {
          setSubCategories(subCategoriesResponse.data.responseBody.data || []);
        }

        // For gender and fitType, we would typically fetch from a dedicated endpoint
        // Since we don't have that, we'll use hardcoded values for now
        // In a real application, these would come from the backend
        setGenders([t("MEN"), t("WOMEN"), t("KIDS")]);
        setFitTypes([t("SLIM"), t("REGULAR"), t("OVERSIZED")]);
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setError("Failed to load filter options. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [backendUrl, t]);

  // Filtering Logic
  useEffect(() => {
    console.log("Starting filtering process...");
    console.log("Available products:", products?.length || 0);
    console.log("Search term:", search);
    
    let filtered = products || [];

    if (search) {
      const lowerSearch = search.toLowerCase();
      console.log("Filtering by search term:", lowerSearch);
      
      filtered = filtered.filter((item) => {
        // Check if product name matches search
        const nameMatch = item.name?.toLowerCase().includes(lowerSearch);

        // Check if category name matches search
        const categoryMatch = item.category
          ?.toLowerCase()
          .includes(lowerSearch);

        // Check if subcategory name matches search
        const subcategoryMatch = item.subCategory
          ?.toLowerCase()
          .includes(lowerSearch);

        // Check if description matches search (if available)
        const descriptionMatch = item.description
          ?.toLowerCase()
          .includes(lowerSearch);

        const matches = nameMatch || categoryMatch || subcategoryMatch || descriptionMatch;
        
        if (matches) {
          console.log("Product matches search:", item.name);
        }

        // Return true if any of the fields match the search term
        return matches;
      });

      console.log("Products after search filter:", filtered.length);

      // If search matches a category name, auto-select that category in the filter
      const matchingCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(lowerSearch)
      );

      if (matchingCategories.length > 0 && selectedCategories.length === 0) {
        // Auto-select matching categories if none are already selected
        const categoryNames = matchingCategories.map((cat) => cat.name);
        setSelectedCategories((prevSelected) => {
          // Only add categories that aren't already selected
          const newSelected = [...prevSelected];
          categoryNames.forEach((name) => {
            if (!newSelected.includes(name)) {
              newSelected.push(name);
            }
          });
          return newSelected;
        });
      }

      // If search matches a subcategory name, auto-select that subcategory in the filter
      const matchingSubcategories = subCategories.filter((subCategory) =>
        subCategory.name.toLowerCase().includes(lowerSearch)
      );

      if (
        matchingSubcategories.length > 0 &&
        selectedSubCategories.length === 0
      ) {
        // Auto-select matching subcategories if none are already selected
        const subcategoryNames = matchingSubcategories.map(
          (subCat) => subCat.name
        );
        setSelectedSubCategories((prevSelected) => {
          // Only add subcategories that aren't already selected
          const newSelected = [...prevSelected];
          subcategoryNames.forEach((name) => {
            if (!newSelected.includes(name)) {
              newSelected.push(name);
            }
          });
          return newSelected;
        });
      }
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
      console.log("Products after category filter:", filtered.length);
    }

    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSubCategories.includes(item.subCategory)
      );
      console.log("Products after subcategory filter:", filtered.length);
    }

    if (selectedGenders.length > 0) {
      filtered = filtered.filter((item) =>
        selectedGenders.includes(item.gender)
      );
      console.log("Products after gender filter:", filtered.length);
    }

    if (selectedFitTypes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedFitTypes.includes(item.fitType)
      );
      console.log("Products after fit type filter:", filtered.length);
    }

    // Apply price range filter
    if (minPrice) {
      filtered = filtered.filter(
        (item) => Number(item.price) >= Number(minPrice)
      );
      console.log("Products after min price filter:", filtered.length);
    }

    if (maxPrice) {
      filtered = filtered.filter(
        (item) => Number(item.price) <= Number(maxPrice)
      );
      console.log("Products after max price filter:", filtered.length);
    }

    // Apply in-stock filter
    if (inStock) {
      filtered = filtered.filter((item) => item.inStock);
      console.log("Products after in-stock filter:", filtered.length);
    }

    // Apply sorting
    if (sortOption === "low-high" || sortOption === "price-low-high") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-low" || sortOption === "price-high-low") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortOption === "az") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "za") {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "date-old-new") {
      filtered = [...filtered].sort((a, b) => a.date - b.date);
    } else if (sortOption === "date-new-old") {
      filtered = [...filtered].sort((a, b) => b.date - a.date);
    }

    console.log("Final filtered products:", filtered.length);
    setFilterProducts(filtered);
  }, [
    search,
    selectedCategories,
    selectedSubCategories,
    selectedGenders,
    selectedFitTypes,
    sortOption,
    products,
    categories,
    subCategories,
    minPrice,
    maxPrice,
    inStock,
  ]);

  return (
    <motion.div
      className="max-w-screen-2xl mx-auto px-4 py-8 mt-20"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Breadcrumbs */}
      <div className="text-xs text-gray-500 mb-4 flex gap-2">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        /
        <Link to="/collection" className="hover:underline">
          Shop
        </Link>{" "}
        /<span className="text-black">{t("PRODUCTS")}</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center my-20 tracking-widest">
        {t("PRODUCTS")}
      </h1>

      {/* Filter/Sort Row */}
      <div className="flex justify-between items-center mb-8">
        <button
          className="text-xs font-semibold tracking-widest flex items-center gap-2 cursor-pointer"
          onClick={() => setShowFilter(true)}
        >
          {/* Tune SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 17h6m0 0v-2m0 2v2m6-6h6m0 0v-2m0 2v2M3 7h6m0 0V5m0 2v2m6 6h6m0 0v-2m0 2v2"
            />
          </svg>
          {t("FILTER_AND_SORT")}
        </button>
        <div className="flex items-center gap-8">
          <select
            className="text-xs w-[180px] font-semibold tracking-widest border-none outline-none bg-transparent cursor-pointer"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="featured">{t("FEATURED")}</option>
            <option value="best-selling">{t("BEST_SELLING")}</option>
            <option value="az">{t("ALPHABETICALLY_AZ")}</option>
            <option value="za">{t("ALPHABETICALLY_ZA")}</option>
            <option value="price-low-high">{t("PRICE_LOW_HIGH")}</option>
            <option value="price-high-low">{t("PRICE_HIGH_LOW")}</option>
            <option value="date-old-new">{t("DATE_OLD_NEW")}</option>
            <option value="date-new-old">{t("DATE_NEW_OLD")}</option>
          </select>
          <span className="text-xs text-gray-500">
            {filterProducts.length} {t("PRODUCTS")}
          </span>
        </div>
      </div>

      {/* Filter Sidebar/Modal */}
      <AnimatePresence>
        {showFilter && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowFilter(false)}
              style={{ pointerEvents: "auto" }}
            />
            {/* Sidebar */}
            <motion.div
              className="fixed top-0 left-0 h-full w-100 bg-white p-6 shadow-lg z-50"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -380 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <button
                className="absolute top-4 right-4 text-xl"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4">{t("FILTER_AND_SORT")}</h2>

              {/* Availability Filter */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                  />
                  Availability (In stock)
                </label>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block mb-1">{t("PRICE")}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="border border-gray-200 outline-none px-2 py-1 w-1/2"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="border border-gray-200 outline-none px-2 py-1 w-1/2"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-4">
                <label className="block mb-1">{t("SORT_BY")}</label>
                <select
                  className="w-full border border-gray-200 outline-none px-2 py-1"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">{t("FEATURED")}</option>
                  <option value="best-selling">{t("BEST_SELLING")}</option>
                  <option value="az">{t("ALPHABETICALLY_AZ")}</option>
                  <option value="za">{t("ALPHABETICALLY_ZA")}</option>
                  <option value="price-low-high">{t("PRICE_LOW_HIGH")}</option>
                  <option value="price-high-low">{t("PRICE_HIGH_LOW")}</option>
                  <option value="date-old-new">{t("DATE_OLD_NEW")}</option>
                  <option value="date-new-old">{t("DATE_NEW_OLD")}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  className="text-xs cursor-pointer"
                  onClick={() => {
                    setInStock(false);
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedCategories([]);
                    setSelectedSubCategories([]);
                    setSelectedGenders([]);
                    setSelectedFitTypes([]);
                    setSortOption("featured");
                  }}
                >
                  {t("CLEAR")}
                </button>
                <button
                  className="bg-black text-white px-4 py-2 text-xs cursor-pointer"
                  onClick={() => setShowFilter(false)}
                >
                  {t("APPLY")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3">Loading products...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>No products available. Please check your connection and try again.</p>
            <p className="text-sm mt-2">Debug: Products array length: {products?.length || 0}</p>
          </div>
        ) : filterProducts.length > 0 ? (
          filterProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400">
            <p>{t("NO_PRODUCTS_MATCH")}</p>
            <p className="text-sm mt-2">Debug: Total products: {products?.length || 0}, Search: "{search}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Collection;
