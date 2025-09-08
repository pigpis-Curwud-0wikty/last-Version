import React, { useContext } from 'react'
import { assets } from '../assets/frontend_assets/assets'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next';

const ReelBaggey = () => {
    const { t } = useTranslation();
    const { products } = useContext(ShopContext);

    // Filter baggey products (you can adjust the filter criteria)
    const baggeyProducts = products.filter(product =>
        product.name.toLowerCase().includes('baggey') ||
        product.name.toLowerCase().includes('baggy') ||
        product.category === 'Denim'
    );

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div>
            <div className='my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]'>
                <div className="text-left text-3xl py-8">
                    <Title className='text-3xl' text1={t('REEL')} text2={t('BAGGEY_COLLECTION')} />
                    <p className='text-left text-lg text-gray-500 mt-2'>
                        {t('BAGGIEST_DENIM')}
                    </p>
                </div>

                {baggeyProducts.length > 0 ? (
                    <motion.div
                        className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {baggeyProducts.slice(0, 4).map((product) => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductItem
                                    id={product._id}
                                    name={product.name}
                                    price={product.price}
                                    finalPrice={product.finalPrice}
                                    image={product.image}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className='text-center text-gray-500 py-8'>
                        <p>{t('NO_BAGGEY_PRODUCTS')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReelBaggey