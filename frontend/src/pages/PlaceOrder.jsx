import React, { useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // 1) Ensure customer has an address (create one from form)
      const addressPayload = {
        phoneNumber: String(formData.phone || ''),
        country: String(formData.country || ''),
        state: String(formData.state || ''),
        city: String(formData.city || ''),
        streetAddress: String(formData.address || ''),
        postalCode: String(formData.zipCode || '')
      };
      const addressRes = await fetch(`${backendUrl}/api/CustomerAddress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressPayload)
      });
      const addressData = await addressRes.json();
      if (!addressRes.ok) {
        toast.error(addressData?.responseBody?.message || 'Failed to create address');
        return;
      }
      const addressId = addressData?.responseBody?.data?.id;
      if (!addressId) {
        toast.error('Address id not returned');
        return;
      }

      // 2) Create order from cart
      const orderPayload = {
        addressId: Number(addressId),
        notes: '',
        paymentMethod: 'Cash'
      };
      const orderRes = await fetch(`${backendUrl}/api/Order/create-from-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();
      if (orderRes.ok && orderData?.responseBody) {
        setCartItems({});
        navigate("/orders");
      } else {
        toast.error(orderData?.responseBody?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
      return;
    }
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const paymentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // const handlePlaceOrder = () => {
  //   const user = localStorage.getItem("user");
  //   if (!user) {
  //     alert("Please login and try again.");
  //     navigate("/log in");
  //     return;
  //   }
  // };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="mt-[80px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] overflow-hidden">
        {/* Left Side */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={formVariants}
          className="flex flex-col gap-4 w-full sm:max-w-[480px]"
        >
          <motion.div
            variants={sectionVariants}
            className="text-xl sm:text-2xl my-3"
          >
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-4"
          >
            <motion.div variants={itemVariants} className="flex gap-3">
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="text"
                name="firstName"
                onChange={onChangeHandler}
                value={formData.firstName}
                placeholder="First Name"
                required
              />
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="text"
                name="lastName"
                onChange={onChangeHandler}
                value={formData.lastName}
                placeholder="Last Name"
                required
              />
            </motion.div>
            <motion.input
              variants={itemVariants}
              className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
              type="email"
              name="email"
              onChange={onChangeHandler}
              value={formData.email}
              placeholder="Email Address"
              required    
            />
            <motion.input
              variants={itemVariants}
              className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
              type="number"
              name="phone"
              onChange={onChangeHandler}
              value={formData.phone}
              placeholder="Phone Number"
              required
            />
            <motion.input
              variants={itemVariants}
              className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
              type="text"
              name="address"
              onChange={onChangeHandler}
              value={formData.address}
              placeholder="Address"
              required
            />
            <motion.div variants={itemVariants} className="flex gap-3">
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="text"
                name="city"
                onChange={onChangeHandler}
                value={formData.city}
                placeholder="City"
                required
              />
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="text"
                name="state"
                onChange={onChangeHandler}
                value={formData.state}
                placeholder="State"
                required
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex gap-3">
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="number"
                name="zipCode"
                onChange={onChangeHandler}
                value={formData.zipCode}
                placeholder="Zip Code"
                required
              />
              <input
                className="border border-gray-300 rounded-md px-3.5 py-1.5 w-full"
                type="text"
                name="country"
                onChange={onChangeHandler}
                value={formData.country}
                placeholder="Country"
                required
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={paymentVariants}
          className="mt-8 p-3"
        >
          <motion.div variants={sectionVariants} className="mt-8 min-w-80">
            <CartTotal />
          </motion.div>
          <motion.div variants={containerVariants} className="mt-12">
            <motion.div variants={itemVariants}>
              <Title text1={"PAYMENT"} text2={"METHOD"} />
            </motion.div>
            {/* Payment Method Selection */}
            <motion.div
              variants={containerVariants}
              className="flex gap-3 flex-col lg:flex-row mt-4"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod("stripe")}
                className="flex gap-3 items-center border border-gray-300 px-3 p-2 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <p
                  className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${paymentMethod === "stripe" ? "bg-green-500" : ""}`}
                ></p>
                <img className="mx-4 h-5" src={assets.stripe_logo} alt="" />
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod("razorpay")}
                className="flex gap-3 items-center border border-gray-300 px-3 p-2 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <p
                  className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${paymentMethod === "razorpay" ? "bg-green-500" : ""}`}
                ></p>
                <img className="mx-4 h-5" src={assets.razorpay_logo} alt="" />
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod("cod")}
                className="flex gap-3 items-center border border-gray-300 px-3 p-2 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <p
                  className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${paymentMethod === "cod" ? "bg-green-500" : ""}`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  CASH ON DELIVERY
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="w-full text-end mt-8"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/orders")}
                className="bg-black text-white px-16 py-3 uppercase font-medium cursor-pointer hover:bg-white hover:text-black border border-black transition-all duration-300"
              >
                Place Order
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </form>
  );
};

export default PlaceOrder;
