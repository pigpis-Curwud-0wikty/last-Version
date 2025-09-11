import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Add from "./pages/Add";
import List from "./pages/List";
import ProductList from "./pages/ProductList";
import ProductVariant from "./pages/ProductVariant";
import DiscountManager from "./pages/DiscountManager";
import ProductDiscountPage from "./pages/ProductDiscountPage";
import BulkDiscountPage from "./pages/BulkDiscountPage";
import Orders from "./pages/Orders";
import OrderCreate from "./pages/OrderCreate";
import Collections from "./pages/Category";
import CollectionManager from "./pages/CollectionManager";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const currency = "$";
// eslint-disable-next-line react-refresh/only-export-components
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr className="border-gray-200" />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/products" element={<ProductList token={token} />} />
                <Route path="/products/:productId/variants" element={<ProductVariant token={token} />} />
                <Route path="/products/:productId/discount" element={<ProductDiscountPage token={token} />} />
                <Route path="/discounts" element={<DiscountManager token={token} />} />
                <Route path="/bulk-discount" element={<BulkDiscountPage token={token} />} />
                <Route path="/sub-category" element={<List token={token} />} />
                <Route
                  path="/collections"
                  element={<Collections token={token} backendUrl={backendUrl} />}
                />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/orders/create" element={<OrderCreate token={token} />} />
                <Route path="/users" element={<Users token={token} />} />
                <Route path="/settings" element={<Settings token={token} />} />
                <Route path="/category/view/:categoryId" element={<Collections token={token} backendUrl={backendUrl} />} />
                <Route path="/category/edit/:categoryId" element={<Collections token={token} backendUrl={backendUrl} />} />
                <Route path="/collection-manager" element={<CollectionManager token={token} />} />
                <Route path="/collection/view/:collectionId" element={<CollectionManager token={token} />} />
                <Route path="/collection/edit/:collectionId" element={<CollectionManager token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
