import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const context = useContext(ShopContext);
  const search = context?.search;
  const setSearch = context?.setSearch;
  const showSearch = context?.showSearch;
  const setShowSearch = context?.setShowSearch;
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    location.pathname.includes("collection")
      ? setVisible(true)
      : setVisible(false);
  }, [location]);
  return showSearch && visible ? (
    <div className="mt-[80px] mb-5 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="border-t border-b border-gray-200 bg-gray-50 text-center">
        <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-3 rounded-full w-3/4 sm:w-1/2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none bg-inherit text-sm"
            type="text"
            placeholder="Search..."
          />
          <img src={assets.search_icon} className="w-4" alt="" />
        </div>
        <img
          onClick={() => setShowSearch(false)}
          src={assets.cross_icon}
          className="inline w-3 cursor-pointer ml-2"
          alt=""
        />
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default SearchBar;
