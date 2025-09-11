import React from 'react';
import { assets } from '../assets/assets';
import { currency } from '../App';

const OrderTable = ({ 
  currentOrders, 
  filteredOrders, 
  handleViewOrder, 
  statusHandler 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Order Items
            </th>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Customer
            </th>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Payment
            </th>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Amount
            </th>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            currentOrders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10"
                      src={assets.parcel_icon}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium">
                        {order.items.length} items
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {item.name} x {item.quantity}
                            {i < order.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {order.address?.firstName} {order.address?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.address?.phone}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">{order.paymentMethod}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium">
                    {currency} {order.amount?.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <select
                    className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    value={order.status}
                    onChange={(e) => statusHandler(order._id, e)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="OutForDelivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleViewOrder(order._id)}
                    className="text-blue-600 hover:text-blue-800 transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;