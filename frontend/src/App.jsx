import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";
import Navbar from "./components/Navbar";
import NavbarPage from "./components/NavbarPage";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import SignUp from "./pages/SignUp";
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import DenimCollection from "./pages/DenimCollection";
import Policy from "./pages/Policy";
import ApiTest from "./components/ApiTest";
  
const App = () => {
  const location = useLocation();
  return (
    <>
      <div>
        {location.pathname === '/' ? <Navbar /> : <NavbarPage />}
        <ToastContainer />
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/denim-collection" element={<DenimCollection />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/api-test" element={<ApiTest />} /> 
        </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;
