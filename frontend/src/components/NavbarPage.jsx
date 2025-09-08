import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const NavbarPage = () => {
  const [visible, setvisible] = useState(false);
  const navigate = useNavigate();
  const context = useContext(ShopContext);
  const { backendUrl } = useContext(ShopContext);
  const setShowSearch = context?.setShowSearch;
  const getCartCount = context?.getCartCount;
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // 🔹 لإدارة القائمة
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    // 🔹 إغلاق القائمة عند الضغط برّه
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/categories?isActive=true&isDeleted=false&page=1&pageSize=50`
        );
        const data = await res.json();

        // Get categories from responseBody
        if (Array.isArray(data.responseBody?.data)) {
          // For each category, fetch its subcategories
          const categoriesWithSubcategories = await Promise.all(
            data.responseBody.data.map(async (category) => {
              try {
                const subRes = await fetch(
                  `${backendUrl}/api/subcategories?categoryId=${category.id}&isActive=true&isDeleted=false&page=1&pageSize=50`
                );
                const subData = await subRes.json();

                // Add subcategories to the category object
                if (Array.isArray(subData.responseBody?.data)) {
                  return {
                    ...category,
                    subcategories: subData.responseBody.data,
                  };
                }
                return { ...category, subcategories: [] };
              } catch (err) {
                console.error(
                  `Error fetching subcategories for category ${category.id}:`,
                  err
                );
                return { ...category, subcategories: [] };
              }
            })
          );

          setCategories(categoriesWithSubcategories);
        } else {
          setCategories([]); // fallback to prevent errors
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [backendUrl]);
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        bg-white shadow-md
       flex items-center py-5 font-medium px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]
      border-b-1 border-white`}
      style={{ backdropFilter: "none" }}
    >
      <ul
        className={`hidden sm:flex gap-5 text-sm text-gray-700 flex-1
        `}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 group ${
              isActive ? "font-bold" : ""
            }`
          }
        >
          <p>{t("HOME")}</p>
          <span className="w-2/4 h-[2px] transition-all duration-300 bg-gray-700 group-hover:w-full group-hover:bg-gray-300 group-hover:opacity-100 opacity-0"></span>
        </NavLink>
        <div className="relative group">
          <NavLink
            to="/collection"
            className="flex items-center gap-1 focus:outline-none"
          >
            SHOP <span className="ml-1">&#9662;</span>
          </NavLink>

          {/* Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <ul className="flex flex-col py-2">
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id} className="relative group/subcategory">
                    <Link
                      to={`/category/${cat.id}`}
                      className="block px-6 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 font-medium transition-colors duration-150"
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        {Array.isArray(cat.subcategories) &&
                          cat.subcategories.length > 0 && (
                            <span className="text-gray-400">›</span>
                          )}
                      </div>
                    </Link>

                    {/* Subcategories */}
                    {Array.isArray(cat.subcategories) &&
                      cat.subcategories.length > 0 && (
                        <ul className="absolute left-full top-0 w-64 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover/subcategory:opacity-100 group-hover/subcategory:visible transition-all duration-200 z-50">
                          {cat.subcategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/subcategory/${sub.id}`}
                                className="block px-6 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors duration-150"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                ))
              ) : (
                <li className="px-6 py-3 text-gray-500">
                  No categories available
                </li>
              )}
            </ul>
          </div>
        </div>
        <NavLink
          to="/policy"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "font-bold" : ""}`
          }
        >
          <p>{t("POLICY")}</p>
        </NavLink>
      </ul>

      <div className="flex-1 flex justify-center">
        <Link to={"/"}>
          <img
            src={assets.logo}
            className="w-20 opacity-100"
            alt="ImgLogo"
            style={{ pointerEvents: "auto" }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-end">
        <img
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt=""
        />

        <div className="relative z-50" ref={profileRef}>
          {user ? (
            <>
              <img
                src={assets.profile_icon}
                className="w-5 cursor-pointer"
                alt=""
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              />

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/change-email"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Email
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Password
                  </Link>
                  <Link
                    to="/upload-photo"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Upload Photo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login">
              <img
                src={assets.profile_icon}
                className="w-5 cursor-pointer"
                alt=""
              />
            </Link>
          )}
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
          onClick={() => setvisible(true)}
        />
        
      </div>

      {/* Sidebar menu for small screen */}
      <div
        className={`absolute top-0 right-0 bottom-0 bg-white h-screen transition-all ${visible ? "w-full" : "w-0"}`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setvisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="" />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setvisible(false)}
            to="/"
            className="py-2 pl-6 border-b-2"
          >
            {t("HOME")}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/collection"
            className="py-2 pl-6 border-b-2"
          >
            {t("COLLECTION")}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/about"
            className="py-2 pl-6 border-b-2"
          >
            {t("ABOUT")}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/contact"
            className="py-2 pl-6 border-b-2"
          >
            {t("CONTACT")}
          </NavLink>
        </div>
      </div>
    </motion.div>
  );
};

export default NavbarPage;
