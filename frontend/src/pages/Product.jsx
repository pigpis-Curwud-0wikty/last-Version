import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { motion, AnimatePresence } from "framer-motion";
import ScrollSectionProduct from "../components/ScrollSectionProduct";
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import HeroBanner from '../components/HeroBanner';

const Product = () => {
  const { t } = useTranslation();
  const { productId } = useParams();
  const { products, loadingProducts, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Intersection observer for ScrollSectionProduct
  const { ref: scrollSectionRef, inView: isScrollSectionInView } = useInView({ threshold: 0.3 });

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(item => item._id === productId);
      if (found) {
        setProductData(found);
        setImage(found.image[0]);
      } else {
        setProductData(null);
      }
    }
  }, [products, productId]);

  if (loadingProducts) return <div>Loading...</div>;
  if (productData === null) return <div>Product not found.</div>;
  if (!productData) return <div>Loading...</div>;


  return productData ? (
    <div className="mt-[80px] mb-5 px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw] border-t border-gray-200">
      {/* Product Data */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex gap-12 sm:gap-12 flex-col sm:flex-row pt-10"
      >
        {/* Product Image */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {
              productData.image.map((item, index) => {
                return (
                  <img onClick={() => setImage(item)} src={item} key={index} alt="ProductImg" className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer max-w-full" />
                )
              })
            }
          </div>
          <div className="w-full sm:w-[80%]">
            <AnimatePresence mode="wait">
              <motion.img
                key={image}
                src={image}
                alt="ProductImg"
                className="w-full max-w-full h-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>
        </div>
        {/* Product Details */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className="pl-2">{122}</p>
          </div>
          <p className="font-medium mt-5 text-3xl">{productData.currency}{productData.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>{t('SELECT_SIZE')}</p>
            <div className="flex gap-2">
              {
                productData.sizes.map((item, index) => {
                  return (
                    <button key={index} className={`px-4 py-2 border border-gray-100 cursor-pointer ${size === item ? "border-orange-500" : ""}`} onClick={() => setSize(item)}>{item}</button>
                  )
                })
              }
            </div>
          </div>
          <button className="cursor-pointer bg-black text-white px-8 py-3 text-sm active:bg-gray-700" onClick={() => addToCart(productData._id, size)}>{t('ADD_TO_CART')}</button>
          <hr className="border-gray-200 mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>{t('PRODUCT_ORIGINAL')}</p>
            <p>{t('PRODUCT_COD')}</p>
            <p>{t('PRODUCT_RETURN_POLICY')}</p>
          </div>
        </div>
      </motion.div>
      {/* Description & Reviews Section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border border-gray-200 px-5 py-3 text-sm">{t('DESCRIPTION')}</b>
          <p className="border border-gray-200 px-5 py-3 text-sm">{t('REVIEWS')} (122)</p>
        </div>
        <div className="flex flex-col gap-4 border border-gray-200 px-6 py-6 text-sm text-gray-500">
          <p>
            {t('PRODUCT_DESC_1')}
          </p>
          <p>
            {t('PRODUCT_DESC_2')}
          </p>
        </div>
      </div>

      {/* Product Video Section */}
      <div className="w-full flex justify-center items-center my-10">
        <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://player.vimeo.com/video/1039701935?background=1"
            title={t('PRODUCT_VIDEO')}
            frameBorder="0"
            allow="autoplay; encrypted-media;"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            tabIndex="-1"
          >
          </iframe>
        </div>
      </div>

      {/* Scroll Section */}
      <div ref={scrollSectionRef} className="-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]">
        <ScrollSectionProduct scroll1={assets.scroll1_max} scroll2={assets.scroll2_max} />
      </div>

      {/* HeroBanner full width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <HeroBanner />
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

      {/* Sticky Animated Rectangle and Modal Dropdown */}
      <AnimatePresence>
        {isScrollSectionInView && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '40px',
              background: 'white',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              padding: '20px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              minWidth: '360px',
              maxWidth: '440px',
            }}
          >
            <img src={productData.image[0]} alt="Product" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: 4 }}>{productData.name}</div>
              <div style={{ fontSize: '1.1rem', color: '#222' }}>{productData.currency}{productData.price}</div>
            </div>
            <button
              style={{
                marginLeft: 16,
                background: 'black',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1.5rem',
                lineHeight: 1,
              }}
              onClick={() => setShowModal(true)}
            >
              +
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isScrollSectionInView && showModal && (
          <motion.div
            key="popover"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: -24 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              bottom: '160px', // 80px (rectangle) + 16px (margin) + modal height offset
              right: '40px',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: 32,
              zIndex: 1100,
              minWidth: 340,
              maxWidth: 480,
              width: '90vw',
            }}
          >
            {/* Arrow Pointer */}
            <div style={{
              position: 'absolute',
              left: 'auto',
              right: 24,
              bottom: -16,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '16px solid white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))',
            }} />
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#888',
                zIndex: 1200,
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Product Image and Info */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
              <img src={productData.image[0]} alt="Product" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 4 }}>{productData.name}</div>
                <div style={{ fontSize: '1.2rem', color: '#222', marginBottom: 8 }}>{productData.currency}{productData.price}</div>
              </div>
            </div>
            {/* Size Selection */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>{t('SELECT_SIZE')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {productData.sizes.map((item, idx) => (
                  <button
                    key={idx}
                    style={{
                      padding: '8px 16px',
                      border: size === item ? '2px solid #f97316' : '1px solid #e5e7eb',
                      borderRadius: 6,
                      background: size === item ? '#fff7ed' : '#fff',
                      color: '#222',
                      cursor: 'pointer',
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {/* Add to Cart Button */}
            <button
              style={{
                width: '100%',
                background: 'black',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '14px 0',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: 8,
              }}
              onClick={() => { addToCart(productData._id, size); setShowModal(false); }}  
            >
              {t('ADD_TO_CART')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : <div className="opacity-0"></div>
};

export default Product;
