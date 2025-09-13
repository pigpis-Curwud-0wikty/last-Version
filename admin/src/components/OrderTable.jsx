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
            currentOrders.map((order, index) => {
              // Normalize fields to support both detailed and summary shapes
              const orderId = order._id || order.id;
              const items = Array.isArray(order.items) ? order.items : [];
              const itemsCount =
                (Array.isArray(items) ? items.length : 0) ||
                Number(order.itemsCount || order.totalItems || 0);
              const customerName = order.address?.firstName
                ? `${order.address?.firstName} ${order.address?.lastName || ""}`.trim()
                : order.customerName || "Customer";
              const phone = order.address?.phone || "";
              const paymentMethod =
                order.paymentMethod ||
                order.paymentMethodName ||
                order.payment?.methodName ||
                order.payment?.name ||
                "N/A";
              const date = order.date || order.createdAt || new Date().toISOString();
              const amount = typeof order.amount === "number" ? order.amount : (order.total ?? 0);
              const status = order.status;
              const isNumericStatus = typeof status === "number";

              return (
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
                        {itemsCount} items
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {items.length > 0 ? items.map((item, i) => (
                          <span key={i}>
                            {item.name} x {item.quantity}
                            {i < items.length - 1 ? ", " : ""}
                          </span>
                        )) : (
                          <span>
                            Order #{order.orderNumber || orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {phone}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium">
                    {currency} {Number(amount || 0).toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <select
                      className="p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                      value={Number(status) || 0}
                      onChange={(e) => statusHandler(orderId, e)}
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={7}>7</option>
                      <option value={8}>8</option>
                      <option value={9}>9</option>
                      <option value={10}>10</option>
                    </select>
                    <span className="text-xs text-gray-600">Code: {Number(status) || 0}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => {
                      const num = order.orderNumber || orderId;
                      console.log("Order number:", num);
                      handleViewOrder(orderId, order.orderNumber);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;