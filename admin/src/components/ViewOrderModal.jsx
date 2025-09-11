import React from 'react';
import { currency } from '../App';

const ViewOrderModal = ({ selectedOrder, setShowViewModal }) => {
  if (!selectedOrder) return null;

  // Calculate order total
  const orderTotal = selectedOrder.items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Order Details
            </h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Order Information</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Order ID:</span>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Date:</span>
                  <p className="font-medium">
                    {new Date(selectedOrder.date).toLocaleString()}
                  </p>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <p className="font-medium">{selectedOrder.status}</p>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Payment Method:</span>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Total Amount:</span>
                  <p className="font-medium">
                    {currency} {orderTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Name:</span>
                  <p className="font-medium">
                    {selectedOrder.address.firstName} {selectedOrder.address.lastName}
                  </p>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 text-sm">Phone:</span>
                  <p className="font-medium">{selectedOrder.address.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Address:</span>
                  <p className="font-medium">
                    {selectedOrder.address.address}, {selectedOrder.address.city},{' '}
                    {selectedOrder.address.state} {selectedOrder.address.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Order Items</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.size || 'N/A'}
                          </div>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {currency} {item.price?.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {currency} {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan="4"
                        className="py-2 px-4 whitespace-nowrap text-right font-medium"
                      >
                        Total:
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {currency} {orderTotal.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowViewModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;