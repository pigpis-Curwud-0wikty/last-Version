import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const LatestCollection = () => {
  const { t } = useTranslation();
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    // Ensure products is an array and has items before slicing
    if (Array.isArray(products) && products.length > 0) {
      setLatestProducts(products.slice(products.length - 8, products.length));
    }
  }, [products]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Do not render the component if there are no products to show
  if (latestProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]">
      <motion.div
        initial="hidden"  
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={itemVariants}
        className="text-left py-8 text-3xl">
        <Title text1={t('LATEST')} text2={t('COLLECTION')} />
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Discover our Latest Collection, where fresh designs meet modern trends.
        </p>
      </motion.div>
      {/* Rendering Products */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6">
        {latestProducts.map((item, index) => (
          <motion.div key={index} variants={itemVariants}>
            <ProductItem
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LatestCollection;
