import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets';
import CartTotal from '../components/CartTotal'
import { motion } from 'framer-motion';

const Cart = () => {
  const { products, currency, cartItems, updataQuantity, navigate, clearCart } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({ _id: items, quantity: cartItems[items][item], size: item });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="mt-[120px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {/* Title Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className='flex justify-between items-center mb-3'>
        <div className='text-2xl'>
          <Title text1={'YOUR'} text2={'CART'} />
        </div>
        {cartData.length > 0 && (
          <button 
            onClick={clearCart} 
            className='bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 transition-all duration-300'
          >
            Clear Cart
          </button>
        )}
      </motion.div>

      {/* Cart Items Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => String(product._id) === String(item._id));
            if (!productData) return null;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className='py-4 border-t border-gray-200 text-gray-700 grid grid-cols-[4fr_1.5fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  <img src={productData.image[0]} alt={productData.name} className='w-16 sm:w-20' />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-4 mt-2'>
                      <p>{currency}{productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border border-gray-300 bg-slate-50'>{item.size}</p>
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={99}
                  defaultValue={item.quantity}
                  onChange={(e) => e.target.value === '' || e.target.value === '0' ? updataQuantity(item._id, item.size, 0) : updataQuantity(item._id, item.size, Number(e.target.value))}
                  className='border border-gray-300 max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 sm:py-2'
                />
                <img className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" onClick={() => updataQuantity(item._id, item.size, 0)} />
              </motion.div>
            )
          })
        }
      </motion.div>

      {/* Checkout Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white px-8 py-3 my-8 uppercase font-medium cursor-pointer hover:bg-white hover:text-black border border-black transition-all duration-300'>Proceed to Checkout</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Cart;