import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const BestSeller = () => {
  const { t } = useTranslation();
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setBestSeller(products.slice(products.length - 4, products.length));
    }
  }, [products]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const productBoxVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      rotateY: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    },
  };

  return (
    <div className="my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
        className="text-left text-3xl py-8">
        <Title text1={t('BEST')} text2={t('SELLERS')} />
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Shop our Best Sellers—customer favorites that never go out of style!
        </p>
      </motion.div>

      {/* Rendering Products */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 mb-10">
        {bestSeller.map((item) => (
          <motion.div
            key={item._id}
            variants={productBoxVariants}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="transform perspective-1000">
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

export default BestSeller;
