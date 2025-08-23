import React, { useEffect } from 'react'
import { useContext , useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'

const Orders = () => {
  const { backendUrl , token , currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if(!token){
        return null
      }
      const res = await fetch(`${backendUrl}/api/Order/customer?page=1&pageSize=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const orders = data?.responseBody?.data || [];
      // Flatten into UI-friendly items similar to old structure
      const allItems = [];
      for (const o of orders) {
        const items = (o.items || []).map(it => ({
          name: it.product?.name,
          price: it.unitPrice ?? it.product?.finalPrice ?? it.product?.price,
          quantity: it.quantity,
          size: it.product?.productVariantForCartDto?.size || 'default',
          image: it.product?.mainImageUrl ? [it.product.mainImageUrl] : [],
          status: o.status,
          date: o.createdAt || o.orderedAt || new Date().toISOString(),
          paymentMethod: o.payment?.paymentMethod?.name || 'Cash'
        }));
        allItems.push(...items);
      }
      setOrderData(allItems.reverse());
    }catch (error) {
      console.error("Error loading order data:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className='border-t border-gray-300 pt-16 mt-[80px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='text-2xl mb-10'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b border-gray-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 text-gray-700'>
                    <p className='text-lg font-medium'>{currency}{item.price}</p>
                    <p className=''>Quantity: {item.quantity}</p>
                    <p className=''>Size: {item.size}</p>
                  </div>
                  <p className='mt-2'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                  <p className='mt-2'>Payment Method: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 bg-green-500 rounded-full'></p>
                  <p className='text-sm md:text-base font-medium'>{item.status}</p>
                </div>
                <button onClick={loadOrderData} className='border border-gray-300 px-4 py-2 rounded-sm font-medium cursor-pointer hover:bg-black hover:text-white transition-all duration-300'>Track Order</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders