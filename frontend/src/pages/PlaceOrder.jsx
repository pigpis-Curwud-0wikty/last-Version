import React, { useState, useEffect, useContext } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);


  const [addressFormData, setAddressFormData] = useState({
    phoneNumber: "",
    country: "",
    state: "",
    city: "",
    streetAddress: "",
    postalCode: "",
    isDefault: false,
    additionalNotes: "",
  });

  // Fetch addresses from API
  const fetchAddresses = async () => {
    const response = await axios.get(`${backendUrl}/api/CustomerAddress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fetchedAddresses = response.data.responseBody.data || [];
    setAddresses(fetchedAddresses);

    // لو فيه عنوان Default يختاره
    const defaultAddress = fetchedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (fetchedAddresses.length > 0) {
      setSelectedAddressId(fetchedAddresses[0].id);
    }
  };


  const addAddress = async (addressData) => {
    const response = await axios.post(`${backendUrl}/api/CustomerAddress`, addressData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.statuscode === 201) {
      toast.success("Address added successfully");
      setShowAddAddressForm(false);
      fetchAddresses();
    }
  };


  const updateAddress = async (addressId, addressData) => {
    const response = await axios.put(`${backendUrl}/api/CustomerAddress/${addressId}`, addressData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.statuscode === 200) {
      toast.success("Address updated successfully");
      fetchAddresses();
    }
  };


  useEffect(() => {
    fetchAddresses();
  }, []);

  const onChangeHandler = (e) => {
    const { name, type, checked, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (editingAddressId) {
      // Update existing address
      await updateAddress(editingAddressId, addressFormData);
      setEditingAddressId(null);
    } else {
      // Add new address
      await addAddress(addressFormData);
    }
    // Reset form and hide it
    setAddressFormData({
      phoneNumber: "",
      country: "",
      state: "",
      city: "",
      streetAddress: "",
      postalCode: "",
      isDefault: false,
      additionalNotes: "",
    });
    setShowAddAddressForm(false);
  };

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
  };

  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      phoneNumber: "",
      country: "",
      state: "",
      city: "",
      streetAddress: "",
      postalCode: "",
      isDefault: false,
      additionalNotes: "",
    });
    setShowAddAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressFormData({
      phoneNumber: address.phoneNumber || "",
      country: address.country || "",
      state: address.state || "",
      city: address.city || "",
      streetAddress: address.streetAddress || "",
      postalCode: address.postalCode || "",
      isDefault: address.isDefault || false,
      additionalNotes: address.additionalNotes || "",
    });
    setShowAddAddressForm(true);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        addressId: selectedAddressId,   // API محتاج الـ id بس
        notes: "Please deliver fast"    // تقدر تحط ملاحظة من الفورم بعدين
      };

      console.log("Submitting order:", orderData);
      console.log("Token being used:", token);
      console.log("Backend URL:", backendUrl);

            const response = await axios.post(
         `${backendUrl}/api/Order`,
              orderData,
         {
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
         }
       );

       console.log("Order response:", response.data);

       if (response.data.statuscode === 200) {
              setCartItems({});
              navigate("/orders");
         toast.success("Order placed successfully!");
            } else {
         toast.error(response.data.responseBody?.message || "Failed to place order");
       }
         } catch (error) {
       console.error("Error placing order:", error.response?.data || error.message);
       
       if (error.response?.status === 403) {
         toast.error("Authentication failed. Please login again.");
         // Optionally redirect to login
         // navigate("/login");
       } else if (error.response?.status === 400) {
         toast.error("Invalid order data. Please check your address selection.");
       } else {
         toast.error("Failed to place order. Please try again.");
       }
     } finally {
      setIsLoading(false);
    }
  };




  // Animation variants
  const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const formVariants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const paymentVariants = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="mt-[80px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] overflow-hidden">
        {/* Left - Address */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={formVariants} className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <motion.div variants={sectionVariants} className="text-xl sm:text-2xl my-3">
            <Title text1={"DELIVERY"} text2={"ADDRESS"} />
          </motion.div>

          <motion.div variants={containerVariants} className="flex flex-col gap-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Address
              </label>
              {addresses.map((address) => (
          <motion.div
                  key={address.id}
                  className={`border rounded-md p-3 transition-colors ${selectedAddressId === address.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                  <div
                    onClick={() => handleAddressSelect(address.id)}
                    className="cursor-pointer"
                  >
                    <p className="font-medium">{address.streetAddress}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p>Phone: {address.phoneNumber}</p>
                    {address.isDefault && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                        Default
                      </span>
                    )}
                  </div>

                  {/* أزرار التعديل والحذف */}
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(address)}
                      className="text-sm px-3 py-1 rounded-md border border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await axios.delete(
                            `${backendUrl}/api/CustomerAddress/${address.id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          if (response.data.statuscode === 200) {
                            toast.success("Address deleted successfully");
                            fetchAddresses();
                          } else {
                            toast.error(
                              response.data.responseBody.message ||
                              "Failed to delete address"
                            );
                          }
                        } catch (error) {
                          console.error("Error deleting address:", error);
                          toast.error("Failed to delete address");
                        }
                      }}
                      className="text-sm px-3 py-1 rounded-md border border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>


            <motion.div variants={itemVariants}>
              <button type="button" onClick={() => {
                if (showAddAddressForm) {
                  // Cancel - hide form and reset
                  setShowAddAddressForm(false);
                  setEditingAddressId(null);
                  setAddressFormData({
                    phoneNumber: "",
                    country: "",
                    state: "",
                    city: "",
                    streetAddress: "",
                    postalCode: "",
                    isDefault: false,
                    additionalNotes: "",
                  });
                } else {
                  // Add new address - open form in add mode
                  handleAddNewAddress();
                }
              }} className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-gray-700 hover:border-gray-400 transition-colors">
                {showAddAddressForm ? "Cancel" : "+ Add New Address"}
              </button>
            </motion.div>

            {showAddAddressForm && (
              <motion.div initial="hidden" animate="visible" variants={containerVariants} className="border border-gray-200 rounded-md p-4 bg-gray-50 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAddressId ? "Update Address" : "Add New Address"}
                </h3>
                <form onSubmit={handleAddAddress}>
                  <motion.input variants={itemVariants} className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full mb-3" type="text" name="streetAddress" onChange={onChangeHandler} value={addressFormData.streetAddress} placeholder="Street Address" required />
                  <motion.div variants={itemVariants} className="flex gap-3 mb-3">
                    <input className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full" type="text" name="city" onChange={onChangeHandler} value={addressFormData.city} placeholder="City" required />
                    <input className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full" type="text" name="state" onChange={onChangeHandler} value={addressFormData.state} placeholder="State" required />
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex gap-3 mb-3">
                    <input className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full" type="text" name="postalCode" onChange={onChangeHandler} value={addressFormData.postalCode} placeholder="Postal Code" required />
                    <input className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full" type="text" name="country" onChange={onChangeHandler} value={addressFormData.country} placeholder="Country" required />
                  </motion.div>
                  <motion.input variants={itemVariants} className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full mb-3" type="tel" name="phoneNumber" onChange={onChangeHandler} value={addressFormData.phoneNumber} placeholder="Phone Number" required />
                  <motion.textarea variants={itemVariants} className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full mb-3" name="additionalNotes" onChange={onChangeHandler} value={addressFormData.additionalNotes} placeholder="Additional Notes (Optional)" rows="2" />
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                    <input type="checkbox" name="isDefault" onChange={onChangeHandler} checked={addressFormData.isDefault} className="rounded" />
                    <label className="text-sm text-gray-700">Set as default address</label>
                  </motion.div>
                  <motion.button variants={itemVariants} type="submit" className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    {editingAddressId ? "Update Address" : "Add Address"}
                  </motion.button>
                </form>
            </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Right - Order Summary */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={paymentVariants} className="mt-8 p-3">
          <motion.div variants={sectionVariants} className="mt-8 min-w-80">
            <CartTotal />
          </motion.div>
          <motion.div variants={containerVariants} className="mt-12">
            <motion.div variants={itemVariants} className="w-full text-end mt-8">
              <motion.button
                type="button"
                whileHover={{ scale: selectedAddressId ? 1.01 : 1 }}
                whileTap={{ scale: selectedAddressId ? 0.95 : 1 }}
                onClick={onSubmitHandler}
                disabled={!selectedAddressId || isLoading}
                className={`px-16 py-3 uppercase font-medium transition-all duration-300 ${selectedAddressId && !isLoading ? "bg-black text-white cursor-pointer hover:bg-white hover:text-black border border-black" : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"}`}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </motion.button>
              {!selectedAddressId && <p className="text-red-500 text-sm mt-2">Please select a delivery address to continue</p>}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder;
