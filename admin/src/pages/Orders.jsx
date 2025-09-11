import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

// Import components
import OrderTable from "../components/OrderTable";
import OrderFilters from "../components/OrderFilters";
import AddOrderForm from "../components/AddOrderForm";
import ViewOrderModal from "../components/ViewOrderModal";
import Pagination from "../components/Pagination";

const Orders = ({ token }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    addressId: 0,
    notes: "",
    products: [],
    selectedProduct: {
      productId: "",
      quantity: 1,
      size: "",
      price: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Handle input change for add order form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: name === "addressId" ? parseInt(value) : value,
    });
  };

  // Handle product selection
  const handleProductChange = (field, value) => {
    // If product is selected, get its price
    if (field === "productId") {
      const selectedProduct = products.find((p) => p.id === value);
      const price = selectedProduct ? selectedProduct.price : 0;

      setNewOrder({
        ...newOrder,
        selectedProduct: {
          ...newOrder.selectedProduct,
          [field]: value,
          price: price,
        },
      });
    } else {
      setNewOrder({
        ...newOrder,
        selectedProduct: {
          ...newOrder.selectedProduct,
          [field]: value,
        },
      });
    }
  };

  // Add product to order
  const addProductToOrder = () => {
    if (!newOrder.selectedProduct.productId) {
      toast.error("Please select a product");
      return;
    }

    const selectedProductDetails = products.find(
      (p) => p.id === newOrder.selectedProduct.productId
    );

    if (!selectedProductDetails) {
      toast.error("Product not found");
      return;
    }

    const productToAdd = {
      ...newOrder.selectedProduct,
      name: selectedProductDetails.name,
      totalPrice:
        newOrder.selectedProduct.price * newOrder.selectedProduct.quantity,
    };

    setNewOrder({
      ...newOrder,
      products: [...newOrder.products, productToAdd],
      selectedProduct: {
        productId: "",
        quantity: 1,
        size: "",
        price: 0,
      },
    });
  };

  // Remove product from order
  const removeProductFromOrder = (index) => {
    const updatedProducts = [...newOrder.products];
    updatedProducts.splice(index, 1);
    setNewOrder({
      ...newOrder,
      products: updatedProducts,
    });
  };

  // Handle input change for add order form
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: name === "addressId" ? parseInt(value) : value,
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle add order form submission
  const handleAddOrder = async (e) => {
    e.preventDefault();

    if (!newOrder.addressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (newOrder.products.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    setLoading(true);
    try {
      // Prepare order data for API
      const orderData = {
        addressId: newOrder.addressId,
        notes: newOrder.notes,
        orderItems: newOrder.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size || "N/A",
          price: product.price,
        })),
      };

      console.log("Submitting order data:", orderData);
      const response = await API.orders.create(orderData, token);

      if (response && response.statuscode === 200) {
        toast.success("Order created successfully!");
        setShowAddModal(false);
        setNewOrder({
          addressId: 0,
          notes: "",
          products: [],
          selectedProduct: {
            productId: "",
            quantity: 1,
            size: "",
            price: 0,
          },
        });
        fetchAllOrders(); // Refresh orders list
      } else {
        // Handle API success but with business logic errors
        const errorMessage =
          response?.responseBody?.message || "Unknown error occurred";
        toast.error(`Failed to create order: ${errorMessage}`);
      }
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.responseBody?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      toast.error(`Failed to create order: ${errorMessage}`);
      console.error("Order creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view order details
  const handleViewOrder = async (orderId) => {
    try {
      const response = await API.orders.getById(orderId, token);
      setSelectedOrder(response.responseBody.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error(
        "Failed to fetch order details: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      // Try the new Fashion-main API endpoint first
      try {
        const fashionMainResponse = await axios.get(`${backendUrl}/api/Order`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          fashionMainResponse.data &&
          fashionMainResponse.data.responseBody &&
          fashionMainResponse.data.responseBody.data
        ) {
          // Transform the Fashion-main API response to match our expected format
          const transformedOrders =
            fashionMainResponse.data.responseBody.data.map((order) => ({
              _id: order.id,
              items:
                order.orderItems?.map((item) => ({
                  name: item.productName,
                  quantity: item.quantity,
                  size: item.size || "N/A",
                  price: item.price,
                })) || [],
              address: {
                firstName: order.customerAddress?.firstName || "N/A",
                lastName: order.customerAddress?.lastName || "",
                address: order.customerAddress?.addressLine || "N/A",
                city: order.customerAddress?.city || "N/A",
                state: order.customerAddress?.state || "N/A",
                zipCode: order.customerAddress?.postalCode || "N/A",
                phone: order.customerAddress?.phoneNumber || "N/A",
              },
              paymentMethod: order.paymentMethod || "N/A",
              date: order.orderDate || new Date().toISOString(),
              amount: order.totalAmount,
              status: order.status,
            }));

          setOrders(transformedOrders);
          return;
        }
      } catch (fashionMainError) {
        console.log("Fashion-main API error:", fashionMainError);
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
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error(error.message || "Failed to fetch orders");
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

        if (
          fashionMainResponse.data &&
          fashionMainResponse.data.statuscode === 200
        ) {
          toast.success("Order status updated successfully");
          await fetchAllOrders(); // Refresh orders after updating status
          return;
        }
      } catch (fashionMainError) {
        console.log("Fashion-main API error:", fashionMainError);
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
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.log("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  // Filter and sort orders based on user selections
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const customerName =
          `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
        const orderId = order._id ? order._id.toLowerCase() : "";
        return customerName.includes(term) || orderId.includes(term);
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "highestAmount":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "lowestAmount":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return filtered;
  };

  // Get current orders for pagination
  const filteredOrders = getFilteredOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fetch customer addresses
  const fetchAddresses = async () => {
    if (!token) return;

    try {
      const response = await API.customerAddresses.getAll(token);

      if (response && response.responseBody && response.responseBody.data) {
        setAddresses(response.responseBody.data);
        console.log("Customer addresses loaded:", response.responseBody.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load customer addresses");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    if (!token) return;

    try {
      const response = await API.products.getAll(token);

      if (response && response.responseBody && response.responseBody.data) {
        setProducts(response.responseBody.data);
        console.log("Products loaded:", response.responseBody.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchAddresses();
    fetchProducts();
  }, [token]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Orders Management
        </h2>
        <div className="flex items-center">
          <button
            onClick={() => navigate('/orders/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Order
          </button>
        </div>
      </div>
      {/* Search and Filter */}
      <OrderFilters
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        handleStatusFilterChange={handleStatusFilterChange}
        sortBy={sortBy}
        handleSortChange={handleSortChange}
      />

      {/* Orders Table */}
      <OrderTable
        currentOrders={currentOrders}
        filteredOrders={filteredOrders}
        handleViewOrder={handleViewOrder}
        statusHandler={statusHandler}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Add New Order
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
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

              <AddOrderForm
                newOrder={newOrder}
                handleInputChange={handleInputChange}
                handleProductChange={handleProductChange}
                addProductToOrder={addProductToOrder}
                removeProductFromOrder={removeProductFromOrder}
                handleAddOrder={handleAddOrder}
                addresses={addresses}
                products={products}
                loading={loading}
                setShowAddModal={setShowAddModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <ViewOrderModal
          selectedOrder={selectedOrder}
          setShowViewModal={setShowViewModal}
        />
      )}
    </div>
  );
};

export default Orders;
