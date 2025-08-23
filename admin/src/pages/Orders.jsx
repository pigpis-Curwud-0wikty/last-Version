import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      // Try the new Fashion-main API endpoint first
      try {
        const fashionMainResponse = await axios.get(
          `${backendUrl}/api/Order/admin`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (fashionMainResponse.data && fashionMainResponse.data.responseBody && 
            fashionMainResponse.data.responseBody.data) {
          // Transform the Fashion-main API response to match our expected format
          const transformedOrders = fashionMainResponse.data.responseBody.data.map(order => ({
            _id: order.id,
            items: order.orderItems?.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              size: item.size || 'N/A',
              price: item.price
            })) || [],
            address: {
              firstName: order.customerAddress?.firstName || 'N/A',
              lastName: order.customerAddress?.lastName || '',
              address: order.customerAddress?.addressLine || 'N/A',
              city: order.customerAddress?.city || 'N/A',
              state: order.customerAddress?.state || 'N/A',
              zipCode: order.customerAddress?.postalCode || 'N/A',
              phone: order.customerAddress?.phoneNumber || 'N/A'
            },
            paymentMethod: order.paymentMethod || 'N/A',
            date: order.orderDate || new Date().toISOString(),
            amount: order.totalAmount,
            status: order.status
          }));
          
          setOrders(transformedOrders);
          return;
        }
      } catch (fashionMainError) {
        console.log('Fashion-main API error:', fashionMainError);
        // Continue to try the original API if Fashion-main API fails
      }
      
      // Fallback to original API
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
      toast.error(error.message || 'Failed to fetch orders');
    }
  };

  const statusHandler = async (orderId, event) => {
    try {
      const newStatus = event.target.value;
      
      // Try the new Fashion-main API endpoint first
      try {
        const fashionMainResponse = await axios.put(
          `${backendUrl}/api/Order/${orderId}/status`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (fashionMainResponse.data && fashionMainResponse.data.statuscode === 200) {
          toast.success("Order status updated successfully");
          await fetchAllOrders(); // Refresh orders after updating status
          return;
        }
      } catch (fashionMainError) {
        console.log('Fashion-main API error:', fashionMainError);
        // Continue to try the original API if Fashion-main API fails
      }
      
      // Fallback to original API
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Order status updated successfully");
        await fetchAllOrders(); // Refresh orders after updating status
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.log('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5">
                        {item.name} x {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5">
                        {item.name} x {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  }
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.address + ", "}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.zipCode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="mt-3">Method : {order.paymentMethod}</p>
              <p>Payment : {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px]">
              {currency}
              {order.amount}
            </p>
            <select
              onChange={(event) => statusHandler(order._id, event)}
              value={order.status}
              className="font-semibold p-2"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="OutForDelivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
