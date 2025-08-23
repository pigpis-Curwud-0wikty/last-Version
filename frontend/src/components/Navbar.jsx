import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [visible, setvisible] = useState(false);
  const navigate = useNavigate();
  const context = useContext(ShopContext);
  const setShowSearch = context?.setShowSearch;
  const getCartCount = context?.getCartCount;
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${context.backendUrl}/api/Account/Logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('Logout successful');
        } else {
          console.error('Logout failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state regardless of API response
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      setUser(null);
      context.setToken(null);
      navigate('/login');
    }
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || hovered ? 'bg-white shadow-md' : 'bg-transparent'} flex items-center justify-between py-5 font-medium px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]
      border-b-1 border-white`}
      style={{ backdropFilter: scrolled ? 'none' : 'blur(0px)' }} 
    >
            <ul className={`hidden sm:flex gap-5 text-sm ${scrolled || hovered ? 'text-gray-700' : 'text-white'}`}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 group ${isActive ? 'font-bold' : ''}`
          }
        >
          <p>{t('HOME')}</p>
          <span className="w-2/4 h-[2px] transition-all duration-300 bg-gray-700 group-hover:w-full group-hover:bg-gray-300 group-hover:opacity-100 opacity-0"></span>
        </NavLink>
        <div className="relative group">
          <button className="flex items-center gap-1 focus:outline-none">
            SHOP <span className="ml-1">&#9662;</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-lg rounded z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
            <ul className="flex flex-col py-2">
              <li><Link to="/shop/shirts" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">SHIRTS</Link></li>
              <li><Link to="/shop/shorts" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">SHORTS</Link></li>
              <li><Link to="/shop/denim" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">DENIM</Link></li>
              <li><Link to="/shop/tees" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">TEES</Link></li>
              <li><Link to="/shop/baby-tees" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">BABY TEES</Link></li>
              <li><Link to="/shop/knit-sets" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">KNIT SETS</Link></li>
              <li><Link to="/shop/knit-shirts" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">KNIT SHIRTS</Link></li>
              <li><Link to="/shop/bucket-hats" className="block px-6 py-2 hover:bg-gray-100 cursor-pointer">BUCKET HATS</Link></li>
            </ul>
          </div>
        </div>
          <NavLink to="/policy" className={({ isActive }) =>
          `flex flex-col items-center gap-1 group ${isActive ? 'font-bold' : ''}`
        }>
          <p>{t('POLICY')}</p>
            <span className="w-2/4 h-[2px] transition-all duration-300 bg-gray-700 group-hover:w-full group-hover:bg-gray-300 group-hover:opacity-100 opacity-0"></span>
        </NavLink>
      </ul>

      <Link to={"/"}>
        <img
          src={assets.logo}
          className={`w-20 transition-opacity duration-300 ${scrolled || hovered ? 'opacity-100' : 'opacity-0'}`}
          alt="ImgLogo"
          style={{ pointerEvents: scrolled || hovered ? 'auto' : 'none' }}
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

        <div 
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {user ? (
            <>
              <img
                src={assets.profile_icon}
                className="w-5 cursor-pointer"
                alt=""
              />
              {hovered && (
                <div className="absolute dropdown-menu right-0 pt-4">
                  <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                    <p className="cursor-pointer hover:text-black">My Profile</p>
                    <p className="cursor-pointer hover:text-black">Orders</p>
                    <p className="cursor-pointer hover:text-black" onClick={handleLogout}>Logout</p>
                  </div>
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
          {user ? (
            <div className="bg-gray-50 py-3 px-6 mb-2">
              <p className="font-medium text-gray-800 mb-1">Hello, {user.name || 'User'}</p>
              <div className="flex flex-col gap-1 text-sm">
                <Link onClick={() => setvisible(false)} to="/profile" className="text-gray-600 hover:text-black">My Profile</Link>
                <Link onClick={() => setvisible(false)} to="/orders" className="text-gray-600 hover:text-black">Orders</Link>
                <Link onClick={() => setvisible(false)} to="/wishlist" className="text-gray-600 hover:text-black">Wishlist</Link>
                <Link onClick={() => setvisible(false)} to="/settings" className="text-gray-600 hover:text-black">Settings</Link>
                <p onClick={() => {handleLogout(); setvisible(false);}} className="text-gray-600 hover:text-black cursor-pointer">Logout</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 py-3 px-6 mb-2">
              <p className="font-medium text-gray-800 mb-1">Account</p>
              <div className="flex flex-col gap-1 text-sm">
                <Link onClick={() => setvisible(false)} to="/login" className="text-gray-600 hover:text-black">Login</Link>
                <Link onClick={() => setvisible(false)} to="/signup" className="text-gray-600 hover:text-black">Register</Link>
              </div>
            </div>
          )}
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

export default Navbar;
