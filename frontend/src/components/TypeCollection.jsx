import React from 'react'
import { assets } from '../assets/frontend_assets/assets'
import { Link } from 'react-router-dom'
import Title from './Title'
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

const collection = [
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

]

const TypeCollection = () => {
    const { t } = useTranslation();
    return (
        <div className='my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]'>
            <div className='text-center text-2xl py-6'>
                <Title text1={t('TYPE')} text2={t('COLLECTION')} />
            </div>
            <Swiper
                modules={[Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 }
                }}
                pagination={{ clickable: true }}
                className="type-collection-swiper"
            >
                {collection.map((item) => (
                    <SwiperSlide key={item.id}>
                        <div className='relative group flex flex-col items-center'>
                            <Link to={`${item.link}`} className="block w-full">
                                <img src={item.image} alt={item.name} className='w-[170px] h-[210px] object-cover rounded-md shadow transition-transform duration-300 mx-auto' />
                                <div className='absolute top-0 left-0 w-full h-full bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center rounded-md'>
                                    <h1 className='prata-regular text-white text-base font-bold text-center drop-shadow'>{t(item.name.toUpperCase())}</h1>
                                </div>
                            </Link>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default TypeCollection