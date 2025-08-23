import React from 'react'
import { assets } from '../assets/frontend_assets/assets'
import { useNavigate } from 'react-router-dom'
import Title from './Title'
import { useTranslation } from 'react-i18next';

const TypeProduct = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // Example product IDs (replace with real IDs as needed)
    const productId1 = 'aaace';
    const productId2 = 'aaacd';
    return (
        <div className='my-10 overflow-hidden px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6'>
                <div className='col-span-1 relative group bg-[#111111]'>
                    <img src={assets.baggey4} alt="winter collection" className='w-full h-full object-cover transition-transform duration-300' />
                    <div className='absolute bottom-0 left-0 w-full h-full p-4 flex flex-col gap-2 items-start justify-end py-15 px-10'>
                        <h1 className='text-white text-4xl font-medium mb-2'>{t('NEWEST_DROP')}</h1>
                        <p className='text-white text-sm font-base mb-4'>{t('BALLON_FIT')}</p>
                        <button
                            className='text-black border border-white cursor-pointer text-sm font-medium bg-white px-8 py-3 hover:bg-[#111111] hover:border-white hover:text-white transition-all duration-300'
                            onClick={() => navigate(`/product/${productId1}`)}
                        >
                            {t('SHOP_NOW')}
                        </button>
                    </div>
                </div>
                <div className='col-span-1 relative group bg-[#111111]'>
                    <img src={assets.baggey3} alt="summer collection" className='w-full h-full object-cover transition-transform duration-300' />
                    <div className='absolute bottom-0 left-0 w-full h-full p-4 flex flex-col gap-2 items-start justify-end py-15 px-10'>
                        <h1 className='text-white text-4xl font-medium mb-2'>{t('NEWEST_DROP')}</h1>
                        <p className='text-white text-sm font-base mb-4'>{t('BALLON_FIT')}</p>
                        <button
                            className='text-black border border-white cursor-pointer text-sm font-medium bg-white px-8 py-3 hover:bg-[#111111] hover:border-white hover:text-white transition-all duration-300'
                            onClick={() => navigate(`/product/${productId2}`)}
                        >
                            {t('SHOP_NOW')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TypeProduct