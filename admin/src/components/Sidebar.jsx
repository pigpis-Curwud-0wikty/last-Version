import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-gray-200'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            <NavLink to="/" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.dashboard_icon} alt="dashboard" />
                <p className='hidden sm:block'>Dashboard</p>
            </NavLink>
            <NavLink to="/add" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.add_icon} alt="logo" />
                <p className='hidden sm:block'>Add Items</p>
            </NavLink>
            <NavLink to="/products" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.collection_icon} alt="logo" />
                <p className='hidden sm:block'>Products</p>
            </NavLink>
            <NavLink to="/discounts" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.discount_icon} alt="discount" />
                <p className='hidden sm:block'>Discounts</p>
            </NavLink>
         
            <NavLink to="/collections" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.collection_icon} alt="logo" />
                <p className='hidden sm:block'>Categories</p>
            </NavLink>
               <NavLink to="/sub-category" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.parcel_icon} alt="logo" />
                <p className='hidden sm:block'>SubCategory</p>
            </NavLink>
            <NavLink to="/orders" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.order_icon} alt="logo" />
                <p className='hidden sm:block'>Orders</p>
            </NavLink>
            <NavLink to="/users" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.users_icon} alt="users" />
                <p className='hidden sm:block'>Users</p>
            </NavLink>
            <NavLink to="/settings" className={"flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l-lg"}>
                <img className='w-5 h-5 sm:w-6 sm:h-6' src={assets.settings_icon} alt="settings" />
                <p className='hidden sm:block'>Settings</p>
            </NavLink>
        </div>
    </div>
  )
}

export default Sidebar