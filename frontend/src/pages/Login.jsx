import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Login = () => {
  const {setToken , backendUrl} = useContext(ShopContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(`${backendUrl}/api/Account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        setError('Server returned an invalid response. Please try again.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful!');
        
        // Handle Fashion-main API response format
        if (data.responseBody && data.responseBody.data) {
          const tokenData = data.responseBody.data;
          console.log('Login successful, received token data:', tokenData);
          
          localStorage.setItem('token', tokenData.token);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          localStorage.setItem('userId', tokenData.userid);
          
          console.log('Token saved to localStorage');
          setToken(tokenData.token); // Set token in ShopContext
          console.log('Token set in ShopContext');
        }

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Handle Fashion-main API error response format
        const errorMessage = data.responseBody?.message || 
                           (data.responseBody?.error?.message) || 
                           'Login failed. Please check your credentials.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        stack: err.stack,
        url: '/api/Account/login'
      });
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto gap-4 text-gray-800 mt-20'
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='text-3xl prata-regular'>Login</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm"
        >
          {success}
        </motion.div>
      )}

      <input 
        type="email" 
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        className='outline-none w-full border-2 border-gray-300 py-2 px-3 rounded-md focus:border-gray-600 transition-colors' 
        placeholder='Enter your Email' 
        required 
      />
      <input 
        type="password" 
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        className='outline-none w-full border-2 border-gray-300 py-2 px-3 rounded-md focus:border-gray-600 transition-colors' 
        placeholder='Enter your Password' 
        required 
      />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Don't have an account? <Link to="/signup" className='hover:text-gray-600 hover:underline transition-all duration-300'>Sign Up</Link></p>
        <p className='cursor-pointer'><Link to="/forgot-password" className='hover:text-gray-600 hover:underline transition-all duration-300'>Forgot Password?</Link></p>
      </div>
      <button 
        type="submit"
        disabled={loading}
        className={`w-full font-light py-2 px-8 mt-4 border border-black transition-all duration-300 cursor-pointer ${
          loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-white hover:text-black'
        }`}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </motion.form>
  )
}

export default Login