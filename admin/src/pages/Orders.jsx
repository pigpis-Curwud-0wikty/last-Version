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
  const [pageSize, setPageSize] = useState(50); // server page size
  const [totalPages, setTotalPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
    setCurrentPage(1); // Reset to first page on sort change
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

  // Handle view order details (prefer GET /api/Order/{orderId}, fallback to number and list)
  const handleViewOrder = async (orderId, orderNumber) => {
    try {
      // 0) Prefer fetching full details by orderId
      if (orderId) {
        try {
          const byIdResp = await axios.get(
            `${backendUrl}/api/Order/${encodeURIComponent(orderId)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = byIdResp?.data?.responseBody?.data;
          if (d) {
            const normalized = {
              _id: d.id,
              orderNumber: d.orderNumber,
              date: d.createdAt,
              status: d.status || d.statusDisplay,
              amount: d.total ?? d.subtotal ?? 0,
              paymentMethod: (() => {
                if (Array.isArray(d.payment) && d.payment.length > 0) {
                  // نجيب أول Payment فيه paymentMethod موجود
                  const pm = d.payment.find((p) => p?.paymentMethod?.name || p?.paymentMethod?.paymentMethod) || d.payment[0];
              
                  return (
                    pm?.paymentMethod?.name ||        // الاسم الأساسي
                    pm?.paymentMethod?.paymentMethod || // fallback لو الاسم مش موجود
                    pm?.paymentProvider?.name ||     // في بعض الـ APIs ممكن تيجي من الـ provider
                    d.paymentMethod ||               // fallback من الداتا الأساسية
                    d.paymentMethodName ||           // fallback تاني
                    "N/A"                            // لو مفيش أي حاجة
                  );
                }
              
                return "N/A"; // لو مفيش أي payment أصلاً
              })(),
              
              items: Array.isArray(d.items)
                ? d.items.map((it) => ({
                    name: it.product?.name || "Item",
                    quantity: it.quantity || 0,
                    size:
                      it.product?.productVariantForCartDto?.size || it.size || "N/A",
                    price:
                      it.unitPrice ?? it.product?.finalPrice ?? it.product?.price ?? 0,
                  }))
                : [],
              // Map customer object into the modal's address shape
              address: {
                firstName: d.customer?.fullName || "Customer",
                lastName: "",
                address: d.customer?.address || "",
                city: "",
                state: "",
                zipCode: "",
                phone: d.customer?.phoneNumber || "",
              },
            };
            setSelectedOrder(normalized);
            setShowViewModal(true);
            return;
          }
        } catch (e) {
          console.warn("Fetch by orderId failed, trying orderNumber/list fallback:", e);
        }
      }

      // If an order number is provided, fetch by number first
      if (orderNumber) {
        try {
          const byNumResp = await axios.get(
            `${backendUrl}/api/Order/number/${encodeURIComponent(orderNumber)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = byNumResp?.data?.responseBody?.data;
          if (d) {
            const normalized = {
              _id: d.id,
              orderNumber: d.orderNumber,
              date: d.createdAt,
              status: d.status || d.statusDisplay,
              amount: d.total ?? d.subtotal ?? 0,
              paymentMethod: (() => {
                if (Array.isArray(d.payment) && d.payment.length > 0) {
                  const pm = d.payment.find((p) => p?.paymentMethod) || d.payment[0];
                  return (
                    pm?.paymentMethod?.name ||
                    pm?.paymentMethod?.paymentMethod ||
                    d.paymentMethod ||
                    d.paymentMethodName ||
                    "N/A"
                  );
                }
                return d.paymentMethod || d.paymentMethodName || "N/A";
              })(),
              items: Array.isArray(d.items)
                ? d.items.map((it) => ({
                    name: it.product?.name || "Item",
                    quantity: it.quantity || 0,
                    size:
                      it.product?.productVariantForCartDto?.size || it.size || "N/A",
                    price: it.unitPrice ?? it.product?.finalPrice ?? it.product?.price ?? 0,
                  }))
                : [],
              address: {
                firstName: d.customer?.fullName || "Customer",
                lastName: "",
                address: d.customer?.address || "",
                city: "",
                state: "",
                zipCode: "",
                phone: d.customer?.phoneNumber || "",
              },
            };
            setSelectedOrder(normalized);
            setShowViewModal(true);
            return;
          }
        } catch (e) {
          console.warn("Fetch by order number failed, falling back:", e);
        }
      }

      // 1) Try to find in current state (supports both id or _id)
      const found = orders.find(
        (o) => String(o._id) === String(orderId) || String(o.id) === String(orderId)
      );
      if (found) {
        setSelectedOrder(found);
        setShowViewModal(true);
        return;
      }

      // 2) Try to fetch list via GET /api/Order and find it
      const listResp = await axios.get(`${backendUrl}/api/Order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = listResp?.data?.responseBody?.data || [];
      const matched = list.find((o) => String(o.id) === String(orderId));
      if (matched) {
        // Try to fetch detailed data to populate payment and address properly
        try {
          const detailResp = await axios.get(
            `${backendUrl}/api/Order/${encodeURIComponent(matched.id)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = detailResp?.data?.responseBody?.data;
          if (d) {
            const normalized = {
              _id: d.id,
              orderNumber: d.orderNumber,
              date: d.createdAt,
              status: d.status || d.statusDisplay,
              amount: d.total ?? d.subtotal ?? 0,
              paymentMethod: (() => {
                if (Array.isArray(d.payment) && d.payment.length > 0) {
                  const pm = d.payment.find((p) => p?.paymentMethod?.name || p?.paymentMethod?.paymentMethod) || d.payment[0];
                  return (
                    pm?.paymentMethod?.name ||
                    pm?.paymentMethod?.paymentMethod ||
                    pm?.paymentProvider?.name ||
                    d.paymentMethod ||
                    d.paymentMethodName ||
                    "N/A"
                  );
                }
                return d.paymentMethod || d.paymentMethodName || "N/A";
              })(),
              items: Array.isArray(d.items)
                ? d.items.map((it) => ({
                    name: it.product?.name || "Item",
                    quantity: it.quantity || 0,
                    size:
                      it.product?.productVariantForCartDto?.size || it.size || "N/A",
                    price:
                      it.unitPrice ?? it.product?.finalPrice ?? it.product?.price ?? 0,
                  }))
                : [],
              // Map customer object into the modal's address shape
              address: {
                firstName: d.customer?.fullName || "Customer",
                lastName: "",
                address: d.customer?.address || "",
                city: "",
                state: "",
                zipCode: "",
                phone: d.customer?.phoneNumber || "",
              },
            };
            setSelectedOrder(normalized);
            setShowViewModal(true);
            return;
          }
        } catch (e) {
          console.warn("Detailed fetch after list match failed:", e);
        }

        // Fallback: minimal normalization if detailed fetch not available
        setSelectedOrder({
          ...matched,
          items: [],
          address: {
            firstName: matched.customerName || "Customer",
            lastName: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            phone: "",
          },
          amount: matched.total,
          date: matched.createdAt,
          paymentMethod: matched.paymentMethod || "N/A",
        });
        setShowViewModal(true);
        return;
      }

      // 3) Fallback to existing detail API if available
      try {
        const response = await API.orders.getById(orderId, token);
        setSelectedOrder(response.responseBody?.data || null);
        setShowViewModal(true);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    } catch (error) {
      toast.error(
        "Failed to fetch order details: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  const fetchAllOrders = async (page = 1, includeDetails = false) => {
    if (!token) {
      return null;
    }
    try {
      setOrdersLoading(true);
      // Try the new Fashion-main API endpoint first
      try {
        const fashionMainResponse = await axios.get(`${backendUrl}/api/Order`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, pageSize },
        });
        const apiData = fashionMainResponse?.data?.responseBody?.data;
        console.log("Fashion-main response:", apiData);
        if (Array.isArray(apiData)) {
          // Transform API response into table-friendly structure, supporting both detailed and summary shapes
          const transformedOrders = apiData.map((order) => {
            const hasDetailed = !!order.orderItems || !!order.customerAddress;
            if (hasDetailed) {
              return {
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
                date: order.orderDate || order.createdAt || new Date().toISOString(),
                amount: order.totalAmount ?? order.total ?? 0,
                status: order.status,
                orderNumber: order.orderNumber,
              };
            }
            // Summary shape: { id, orderNumber, customerName, status, total, createdAt }
            return {
              _id: order.id,
              items: [],
              address: {
                firstName: order.customerName || "Customer",
                lastName: "",
                address: "",
                city: "",
                state: "",
                zipCode: "",
                phone: "",
              },
              paymentMethod: "N/A",
              date: order.createdAt || new Date().toISOString(),
              amount: order.total ?? 0,
              status: order.status,
              orderNumber: order.orderNumber,
            };
          });

          if (includeDetails) {
            // Optional slow enrichment (disabled by default for speed)
            try {
              const detailedList = await Promise.all(
                apiData.map(async (o) => {
                  try {
                    const detailResp = await axios.get(
                      `${backendUrl}/api/Order/${encodeURIComponent(o.id)}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const detail = detailResp?.data?.responseBody?.data;
                    if (!detail) return null;
                    const items = Array.isArray(detail.items)
                      ? detail.items.map((it) => ({
                          name: it.product?.name || it.name || "Item",
                          quantity: it.quantity || 0,
                          size:
                            it.product?.productVariantForCartDto?.size || it.size || "N/A",
                          price:
                            it.unitPrice ?? it.product?.finalPrice ?? it.product?.price ?? it.price ?? 0,
                        }))
                      : Array.isArray(detail.orderItems)
                      ? detail.orderItems.map((it) => ({
                          name: it.productName || it.name || "Item",
                          quantity: it.quantity || 0,
                          size: it.size || "N/A",
                          price: it.price || 0,
                        }))
                      : [];
                    const pm0 = Array.isArray(detail.payment) ? detail.payment[0] : null;
                    const paymentMethod =
                      pm0?.paymentMethod?.name ||
                      pm0?.paymentMethod?.paymentMethod ||
                      detail.paymentMethod ||
                      detail.paymentMethodName ||
                      "N/A";
                    return { id: o.id, items, paymentMethod };
                  } catch (e) {
                    return null;
                  }
                })
              );

              const byId = new Map(
                detailedList.filter(Boolean).map((d) => [String(d.id), d])
              );
              const merged = transformedOrders.map((t) => {
                const d = byId.get(String(t._id));
                if (!d) return t;
                return {
                  ...t,
                  items: d.items?.length ? d.items : t.items,
                  paymentMethod: d.paymentMethod || t.paymentMethod,
                };
              });
              setOrders(merged);
            } catch (mergeErr) {
              console.warn("Could not enrich orders with details:", mergeErr);
              setOrders(transformedOrders);
            }
          } else {
            setOrders(transformedOrders);
          }
          const hasNext = Array.isArray(apiData) && apiData.length >= pageSize;
          setTotalPages(hasNext ? page + 1 : page);
          setCurrentPage(page);
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
        const hasNext = Array.isArray(response.data.orders) && response.data.orders.length >= pageSize;
        setTotalPages(hasNext ? page + 1 : page);
        setCurrentPage(page);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const statusHandler = async (orderId, event) => {
    try {
      const raw = event?.target?.value;
      const newStatus = Number(raw);

      // Guard: API requires integer status 0..10
      if (!Number.isFinite(newStatus)) {
        toast.error("Please select a numeric order status (0..10)");
        return;
      }

      // Guard: API requires integer orderId in the path
      const oid = Number(orderId);
      if (!Number.isFinite(oid)) {
        toast.error("Invalid order ID");
        return;
      }

      const putResp = await axios.put(
        `${backendUrl}/api/Order/${oid}/status`,
        { notes: "" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          params: { status: newStatus },
        }
      );

      const ok =
        putResp?.data?.statuscode === 200 ||
        putResp?.data?.statuscode === 0 ||
        putResp?.data?.responseBody?.data === true;
      if (ok) {
        toast.success("Order status updated successfully");
        await fetchAllOrders();
        return;
      }

      const msg =
        putResp?.data?.responseBody?.message ||
        putResp?.data?.responseBody?.errors?.messages?.[0] ||
        "Failed to update order status";
      toast.error(msg);

      // If not OK (or backend rejected query param), retry sending status in body
      try {
        const altResp = await axios.put(
          `${backendUrl}/api/Order/${oid}/status`,
          { status: newStatus, notes: "" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const altOk =
          altResp?.data?.statuscode === 200 ||
          altResp?.data?.statuscode === 0 ||
          altResp?.data?.responseBody?.data === true;
        if (altOk) {
          toast.success("Order status updated successfully");
          await fetchAllOrders();
          return;
        }
        const altMsg =
          altResp?.data?.responseBody?.message ||
          altResp?.data?.responseBody?.errors?.messages?.[0] ||
          "Failed to update order status";
        toast.error(altMsg);
      } catch (altErr) {
        console.error("Retry PUT with status in body failed:", altErr?.response?.data || altErr);
        throw altErr;
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.responseBody?.message ||
        error?.response?.data?.responseBody?.errors?.messages?.[0] ||
        error?.message ||
        "Failed to update order status";
      console.error("PUT /api/Order/{id}/status error:", error);
      toast.error(errMsg);
    }
  };

  // Filter and sort orders based on user selections
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Normalize amount helper: handles numbers or strings with currency symbols
    const normalizeAmount = (val) => {
      const raw = val ?? 0;
      if (typeof raw === "number") return raw;
      const num = parseFloat(String(raw).replace(/[^0-9.+-]/g, ""));
      return Number.isFinite(num) ? num : 0;
    };

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const firstName = String(order.address?.firstName || "");
        const lastName = String(order.address?.lastName || "");
        const customerName = `${firstName} ${lastName}`.trim().toLowerCase();
        const orderId = String(order._id || order.id || "").toLowerCase();
        const orderNumber = String(order.orderNumber || "").toLowerCase();

        // Collect item names from both shapes (items or orderItems)
        const itemsA = Array.isArray(order.items) ? order.items : [];
        const itemsB = Array.isArray(order.orderItems) ? order.orderItems : [];
        const itemNamesMatch = [...itemsA, ...itemsB].some((it) =>
          String(it?.name || it?.productName || "").toLowerCase().includes(term)
        );

        return (
          customerName.includes(term) ||
          orderId.includes(term) ||
          orderNumber.includes(term) ||
          itemNamesMatch
        );
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest": {
        filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        break;
      }
      case "oldest": {
        filtered.sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
        break;
      }
      case "amount-high":
      case "highestAmount": {
        filtered.sort((a, b) => {
          const aAmt = normalizeAmount(a.amount ?? a.total ?? 0);
          const bAmt = normalizeAmount(b.amount ?? b.total ?? 0);
          return bAmt - aAmt;
        });
        break;
      }
      case "amount-low":
      case "lowestAmount": {
        filtered.sort((a, b) => {
          const aAmt = normalizeAmount(a.amount ?? a.total ?? 0);
          const bAmt = normalizeAmount(b.amount ?? b.total ?? 0);
          return aAmt - bAmt;
        });
        break;
      }
      default: {
        filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      }
    }

    return filtered;
  };

  // Get current orders for pagination (server-side paging)
  const filteredOrders = getFilteredOrders();
  const currentOrders = filteredOrders; // already a single server page

  // Change page
  const paginate = (pageNumber) => {
    if (ordersLoading) return; // prevent double fetches
    const target = Math.max(1, pageNumber);
    fetchAllOrders(target, false); // fast fetch without enrichment
  };

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
    fetchAllOrders(1, false); // initial fast fetch
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

      {ordersLoading && (
        <div className="flex justify-center items-center mt-2 text-sm text-gray-600">
          Loading orders...
        </div>
      )}

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
