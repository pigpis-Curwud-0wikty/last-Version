import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({setToken}) => {
  return (
    <div className='flex justify-between items-center px-[4%] py-2'>
        <img className='w-[max(10%,80px)]' src={assets.logo} alt="logo" />
        <button className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full' onClick={() => {
            setToken('')
            localStorage.removeItem('token')    
        }}>Logout</button>
    </div>
  )
}

export default Navbar