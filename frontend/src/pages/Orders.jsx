import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      if (!token) {
        return null
      }

      // First, get the list of orders
      const res = await fetch(`${backendUrl}/api/Order?page=1&pageSize=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const orders = data?.responseBody?.data || [];

      // Then, fetch detailed information for each order to get product details
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const detailRes = await axios.get(`${backendUrl}/api/Order/${order.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const orderDetail = detailRes.data?.responseBody?.data;

            // Transform order items to display format using the correct API structure
            const orderItems = (orderDetail?.items || []).map(item => ({
              id: order.id,
              orderNumber: orderDetail?.orderNumber || order.orderNumber,
              customerName: orderDetail?.customer?.fullName || order.customerName,
              status: orderDetail?.status || order.status,
              total: orderDetail?.total || order.total,
              date: orderDetail?.createdAt || order.createdAt,
              // Use actual product image from mainImageUrl
              image: item.product?.mainImageUrl
                ? [item.product.mainImageUrl]
                : ['/api/placeholder/80/80'], // Fallback to placeholder if no image
              name: item.product?.name || `Order #${orderDetail?.orderNumber || order.orderNumber}`,
              price: item.unitPrice || item.product?.finalPrice || item.product?.price || item.totalPrice,
              quantity: item.quantity || 1,
              size: item.product?.productVariantForCartDto?.size || 'N/A',
              color: item.product?.productVariantForCartDto?.color || 'N/A',
              paymentMethod: orderDetail?.payment?.[0]?.paymentMethod?.paymentMethod || 'N/A'
            }));

            return orderItems;
          } catch (error) {
            console.error(`Error fetching details for order ${order.id}:`, error);
            // Fallback to basic order info if detailed fetch fails
            return [{
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              status: order.status,
              total: order.total,
              date: order.createdAt,
              image: ['/api/placeholder/80/80'],
              name: `Order #${order.orderNumber}`,
              price: order.total,
              quantity: 1,
              size: 'N/A',
              color: 'N/A',
              paymentMethod: 'N/A'
            }];
          }
        })
      );

      // Flatten the array of order items and reverse for newest first
      const allOrderItems = detailedOrders.flat().reverse();
      setOrderData(allOrderItems);
    } catch (error) {
      console.error("Error loading order data:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Handle payment return from external gateways
  const handlePaymentReturn = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status') || urlParams.get('payment_status');
    const pendingOrderNumber = localStorage.getItem('pendingOrderNumber');
    const paymentRedirectTime = localStorage.getItem('paymentRedirectTime');

    // Check if user is returning from a payment gateway
    if (pendingOrderNumber && paymentRedirectTime) {
      const timeDiff = Date.now() - parseInt(paymentRedirectTime);
      // Only show message if return is within 10 minutes (to avoid stale messages)
      if (timeDiff < 10 * 60 * 1000) {
        if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'approved') {
          toast.success(`Payment completed successfully! Order #${pendingOrderNumber} has been processed.`);
        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'declined') {
          toast.error(`Payment was not completed. Please try again or contact support for Order #${pendingOrderNumber}.`);
        } else {
          // Generic success message if no specific status but user returned from payment
          toast.success(`Thank you! Your order #${pendingOrderNumber} has been submitted. Please check the status below.`);
        }
      }

      // Clear stored payment info
      localStorage.removeItem('pendingOrderNumber');
      localStorage.removeItem('paymentRedirectTime');

      // Clean up URL parameters
      if (urlParams.toString()) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  };

  // Handle track order button click
  const handleTrackOrder = async (orderId) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      
      const response = await axios.get(`${backendUrl}/api/Order/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const orderDetails = response.data?.responseBody?.data;
      setSelectedOrderDetails(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrderDetails(null);
  };

  useEffect(() => {
    loadOrderData();
    handlePaymentReturn();
  }, [token]);

  return (
    <div className='border-t border-gray-300 pt-16 mt-[80px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='text-2xl mb-10'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Loading orders...</span>
          </div>
        ) : orderData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No orders found</p>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b border-gray-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img 
                  className='w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md' 
                  src={item.image[0]} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/80/80';
                  }}
                />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 text-gray-700'>
                    <p className='text-lg font-medium'>{currency}{item.price}</p>
                    <p className=''>Quantity: {item.quantity}</p>
                    <p className=''>Size: {item.size}</p>
                    <p className=''>Color: {item.color}</p>
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
                <button 
                  onClick={() => handleTrackOrder(item.id)} 
                  className='border border-gray-300 px-4 py-2 rounded-sm font-medium cursor-pointer hover:bg-black hover:text-white transition-all duration-300'
                >
                  Track Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3">Loading order details...</span>
                </div>
              ) : selectedOrderDetails ? (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Order Number:</span> {selectedOrderDetails.orderNumber}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            selectedOrderDetails.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            selectedOrderDetails.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            selectedOrderDetails.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedOrderDetails.statusDisplay || selectedOrderDetails.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Order Date:</span> {new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-medium">Total:</span> {currency}{selectedOrderDetails.total}</p>
                        {selectedOrderDetails.notes && (
                          <p><span className="font-medium">Notes:</span> {selectedOrderDetails.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedOrderDetails.customer?.fullName}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrderDetails.customer?.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrderDetails.customer?.phoneNumber}</p>
                        {selectedOrderDetails.customer?.address && (
                          <p><span className="font-medium">Address:</span> {selectedOrderDetails.customer.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrderDetails.items?.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 flex items-start gap-4">
                          <img 
                            src={item.product?.mainImageUrl || '/api/placeholder/80/80'}
                            alt={item.product?.name}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/80/80';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Size: {item.product?.productVariantForCartDto?.size || 'N/A'}</p>
                              <p>Color: {item.product?.productVariantForCartDto?.color || 'N/A'}</p>
                              <p>Quantity: {item.quantity}</p>
                              <p>Unit Price: {currency}{item.unitPrice}</p>
                              <p className="font-medium">Total: {currency}{item.totalPrice}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Information */}
                  {selectedOrderDetails.payment && selectedOrderDetails.payment.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedOrderDetails.payment.map((payment, index) => (
                          <div key={index} className="space-y-2 text-sm">
                            <p><span className="font-medium">Payment Method:</span> {payment.paymentMethod?.name}</p>
                            <p><span className="font-medium">Amount:</span> {currency}{payment.amount}</p>
                            <p><span className="font-medium">Payment Date:</span> {new Date(payment.paymentDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Status:</span> 
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                payment.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.status === 1 ? 'Completed' : 'Pending'}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{currency}{selectedOrderDetails.subtotal}</span>
                      </div>
                      {selectedOrderDetails.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{currency}{selectedOrderDetails.taxAmount}</span>
                        </div>
                      )}
                      {selectedOrderDetails.shippingCost > 0 && (
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{currency}{selectedOrderDetails.shippingCost}</span>
                        </div>
                      )}
                      {selectedOrderDetails.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{currency}{selectedOrderDetails.discountAmount}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{currency}{selectedOrderDetails.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Order Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Order Placed - {new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedOrderDetails.shippedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Shipped - {new Date(selectedOrderDetails.shippedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedOrderDetails.deliveredAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Delivered - {new Date(selectedOrderDetails.deliveredAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedOrderDetails.cancelledAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Cancelled - {new Date(selectedOrderDetails.cancelledAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Failed to load order details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t">
              <button 
                onClick={closeModal}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders