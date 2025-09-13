import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/frontend_assets/assets'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next';

const ReelBaggey = () => {
    const { t } = useTranslation();
    const { backendUrl } = useContext(ShopContext);
    
    const [baggeyProducts, setBaggeyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [subcategory, setSubcategory] = useState(null);

    useEffect(() => {
        const fetchBaggey2Products = async () => {
            try {
                setLoading(true);
                setError("");

                // First, find the subcategory with name "Baggey2"
                const subcategoriesResponse = await fetch(
                    `${backendUrl}/api/subcategories?isActive=true&includeDeleted=false`
                );
                const subcategoriesData = await subcategoriesResponse.json();

                if (subcategoriesResponse.ok && subcategoriesData.responseBody) {
                    const subcategories = subcategoriesData.responseBody.data || [];
                    const baggey2Subcategory = subcategories.find(
                        sub => sub.id === 8
                    );

                    if (baggey2Subcategory) {
                        setSubcategory(baggey2Subcategory);

                        // Fetch products for the Baggey2 subcategory
                        const productsResponse = await fetch(
                            `${backendUrl}/api/products?subCategoryId=${baggey2Subcategory.id}&isActive=true&includeDeleted=false&page=1&pageSize=50`
                        );
                        const productsData = await productsResponse.json();

                        if (
                            productsResponse.ok &&
                            Array.isArray(productsData.responseBody?.data)
                        ) {
                            setBaggeyProducts(productsData.responseBody.data);
                        } else {
                            setBaggeyProducts([]);
                        }
                    } else {
                        setError("Baggey2 subcategory not found");
                        setBaggeyProducts([]);
                    }
                } else {
                    setError(subcategoriesData.message || "Failed to load subcategories");
                }
            } catch (err) {
                console.error("Error fetching Baggey2 products:", err);
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBaggey2Products();
    }, [backendUrl]);

    return (
        <motion.div
            className="mx-auto px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw] py-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: 60 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: "easeOut" },
                },
            }}
        >
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-600 p-4 bg-red-100 rounded-md">
                    {error}
                </div>
            ) : (
                <>
                    {/* Subcategory Header */}
                    <div className="text-center mb-8 text-start">
                        <h1 className="text-2xl tracking-wide mb-4 uppercase">
                            <Title text1={t('REEL')} text2={t('BAGGEY_COLLECTION')} />
                        </h1>
                        <p className="text-gray-600 max-w-3xl">
                            <p>{t('BAGGIEST_DENIM')}</p>
                        </p>
                    </div>


                    {/* Products Grid */}
                    {baggeyProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {baggeyProducts.slice(0, 8).map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 my-8">
                            <p>{t('NO_BAGGEY_PRODUCTS')}</p>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    )
}

export default ReelBaggey