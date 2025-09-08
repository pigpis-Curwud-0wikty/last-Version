import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../assets/frontend_assets/assets'
import { Link } from 'react-router-dom'
import Title from './Title'
import { useTranslation } from 'react-i18next';
import { ShopContext } from '../context/ShopContext';

const TypeCollection = () => {
    const { t } = useTranslation();
    const { backendUrl } = useContext(ShopContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fallback collection in case API fails
    const fallbackCollection = [
        {
            id: 1,
            name: 'Denim',
            image: assets.eniem,
            link: '/denim-collection'
        },
        {
            id: 2,
            name: 'T-Shirts',
            image: assets.TShirts_img,
            link: '/t-shirts-collection'
        },
        {
            id: 3,
            name: 'Jakets',
            image: assets.Jakets_img,
            link: '/jakets-collection'
        },
        {
            id: 4,
            name: 'Joggers',
            image: assets.Joggers_img,
            link: '/joggers-collection'
        },
    ];

    useEffect(() => {
        const fetchActiveCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(
                    `${backendUrl}/api/categories?isActive=true&isDeleted=false&page=1&pageSize=50`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.responseBody?.data && Array.isArray(data.responseBody.data)) {
                    // Transform API data to match our component structure
                    const transformedCategories = data.responseBody.data.map((category, index) => ({
                        id: category.id,
                        name: category.name,
                        image: category.image || assets.eniem, // Use category image or fallback
                        link: `/category/${category.id}`,
                        description: category.description || ''
                    }));
                    
                    setCategories(transformedCategories);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            } catch (err) {
                console.error('Error fetching active categories:', err);
                setError(err.message);
                // Use fallback collection on error
                setCategories(fallbackCollection);
            } finally {
                setLoading(false);
            }
        };

        if (backendUrl) {
            fetchActiveCategories();
        }
    }, [backendUrl]);

    // Use categories from API or fallback to hardcoded collection
    const displayCategories = categories.length > 0 ? categories : fallbackCollection;
    return (
        <div className='my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]'>
            <div className='text-center text-2xl py-6 mb-6'>
                <Title text1={t('TYPE')} text2={t('CATEGORY')} />
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">{t('LOADING')}...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{t('ERROR_LOADING_CATEGORIES')}</p>
                    <p className="text-sm text-gray-500">{t('USING_FALLBACK_CATEGORIES')}</p>
                </div>
            ) : null}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayCategories.map((item) => (
                    <Link
                        key={item.id}
                        to={`${item.link}`}
                        className="block border border-gray-200 rounded-lg hover:shadow-lg transition-all"
                    >
                        <div className="overflow-hidden rounded-t-lg h-100 bg-gray-100 flex items-center justify-center">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-lg">
                                {t(item.name.toUpperCase())}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {item.description || "View products"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default TypeCollection