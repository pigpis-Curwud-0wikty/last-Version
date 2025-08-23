import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const Collection = () => {
  const { t } = useTranslation();
  const { products, search } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortOption, setSortOption] = useState("relavent");

  useEffect(() => {
    let filtered = products;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTypes.includes(item.subCategory)
      );
    }
    if (sortOption === "low-high") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-low") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }
    setFilterProducts(filtered);
  }, [search, selectedCategories, selectedTypes, sortOption, products]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Animation variants for sections only
  const sectionFade = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div className="mt-[80px] mb-5">
      <div className="flex flex-col lg:flex-row gap-1 lg:gap-10 pt-10 border-t border-gray-300 overflow-hidden px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        {/* Filter Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionFade}
          className="min-w-60">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="my-2 text-xl flex items-center cursor-pointer gap-2"
          >
            {t('FILTERS')}
            <img
              className={`h-3 lg:hidden ${showFilter ? "rotate-90" : ""}`}
              src={assets.dropdown_icon}
              alt=""
            />
          </p>
          {/* Category Filters */}
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden lg:block"
            }`}
          >
            <p className="mb-3 text-sm font-medium">{t('CATEGORIES')}</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {[t('T_SHIRTS'), t('JACKETS'), t('DENIM'), t('CARGOS')].map((cat) => (
                <label key={cat} className="flex gap-2 items-center">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={cat}
                    onChange={handleCategoryChange}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          {/* Type/Subcategory Filters */}
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden lg:block"
            }`}
          >
            <p className="mb-3 text-sm font-medium">{t('TYPE')}</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {[t('MEN'), t('WOMEN'), t('KIDS')].map((type) => (
                <label key={type} className="flex gap-2 items-center">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={type}
                    onChange={handleTypeChange}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Product Section */}
        <div className="flex-1">
          {/* Header Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionFade}
            className="flex justify-between text-base sm:text-2xl mb-4">
            <Title text1={t('ALL')} text2={t('COLLECTION')} />
            <select
              className="border-2 border-gray-300 text-sm px-2"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="relavent">{t('SORT_BY_RELEVANT')}</option>
              <option value="low-high">{t('SORT_BY_LOW_HIGH')}</option>
              <option value="high-low">{t('SORT_BY_HIGH_LOW')}</option>
            </select>
          </motion.div>
          {/* Products Grid Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionFade}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.length > 0 ? (
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
              <p className="text-center col-span-full text-gray-400">
                {t('NO_PRODUCTS_MATCH')}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
