import React, { useContext, useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const NavbarPage = () => {
  const [visible, setvisible] = useState(false);
  const navigate = useNavigate();
  const context = useContext(ShopContext);
  const setShowSearch = context?.setShowSearch;
  const getCartCount = context?.getCartCount;
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white flex items-center justify-between py-5 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] border-b-3 border-gray-300"
      style={{ backdropFilter: 'none' }}
    >
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'font-bold' : ''}`
          }
        >
          <p>{t('HOME')}</p>
        </NavLink>
        <div className="relative">
          <button className="flex items-center gap-1 focus:outline-none">
            SHOP <span className="ml-1">&#9662;</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-lg rounded z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
            <ul className="flex flex-col py-2">
              <li><Link to="/shop/shirts" className="block px-6 py-2 cursor-pointer text-gray-700">SHIRTS</Link></li>
              <li><Link to="/shop/shorts" className="block px-6 py-2 cursor-pointer text-gray-700">SHORTS</Link></li>
              <li><Link to="/shop/denim" className="block px-6 py-2 cursor-pointer text-gray-700">DENIM</Link></li>
              <li><Link to="/shop/tees" className="block px-6 py-2 cursor-pointer text-gray-700">TEES</Link></li>
              <li><Link to="/shop/baby-tees" className="block px-6 py-2 cursor-pointer text-gray-700">BABY TEES</Link></li>
              <li><Link to="/shop/knit-sets" className="block px-6 py-2 cursor-pointer text-gray-700">KNIT SETS</Link></li>
              <li><Link to="/shop/knit-shirts" className="block px-6 py-2 cursor-pointer text-gray-700">KNIT SHIRTS</Link></li>
              <li><Link to="/shop/bucket-hats" className="block px-6 py-2 cursor-pointer text-gray-700">BUCKET HATS</Link></li>
            </ul>
          </div>
        </div>
        <NavLink to="/policy" className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'font-bold' : ''}`
        }>
          <p>{t('POLICY')}</p>
        </NavLink>
      </ul>

      <Link to={"/"}>
        <img
          src={assets.logo}
          className="w-20 opacity-100"
          alt="ImgLogo"
          style={{ pointerEvents: 'auto' }}
        />
      </Link>

      <div className="flex items-center gap-6">
        <img
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt=""
        />

        <div className="group relative">
          {user ? (
            <>
              <img
                src={assets.profile_icon}
                className="w-5 cursor-pointer"
                alt=""
              />
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                  <p className="cursor-pointer hover:text-black">My Profile</p>
                  <p className="cursor-pointer hover:text-black">Orders</p>
                  <p className="cursor-pointer hover:text-black" onClick={handleLogout}>Logout</p>
                </div>
              </div>
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
        <button onClick={toggleLanguage} className="focus:outline-none">
          🌐 {i18n.language === 'en' ? 'AR' : 'EN'}
        </button>
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
            {t('HOME')}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/collection"
            className="py-2 pl-6 border-b-2"
          >
            {t('COLLECTION')}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/about"
            className="py-2 pl-6 border-b-2"
          >
            {t('ABOUT')}
          </NavLink>
          <NavLink
            onClick={() => setvisible(false)}
            to="/contact"
            className="py-2 pl-6 border-b-2"
          >
            {t('CONTACT')}
          </NavLink>
        </div>
      </div>
    </motion.div>
  );
};

export default NavbarPage;