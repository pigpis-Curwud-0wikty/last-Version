import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const sliderImages = [
  assets.hero_img2,
  assets.hero_img3,
];

const HeroImage = () => {
  const { t } = useTranslation();
  const swiperRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-[100vh] overflow-hidden m-0 p-0">
      {/* Swiper Slider as Hero Image */}
      <Swiper
        modules={[Autoplay]}
        loop
        grabCursor={true}
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        className="absolute inset-0 w-full h-full m-0 p-0 hero-swiper"
        onSwiper={swiper => (swiperRef.current = swiper)}
        onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
      >
        {sliderImages.map((img, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={img}
              alt={`slide-${idx}`}
              className="w-full h-full object-cover object-center m-0 p-0"
              style={{ zIndex: 0 }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-opacity-30 z-10 m-0 p-0"
        style={{ pointerEvents: 'none' }}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg text-center m-0 p-0">
            {activeIndex === 0 ? t('HERO_IMAGE_TITLE') : 'SS25'}
          </h1>
          <Link to="/collection" style={{ pointerEvents: 'auto' }}>
            <button className="bg-transparent text-white px-8 py-3 rounded shadow hover:bg-white hover:text-black border border-white transition-all duration-300 text-lg font-medium m-0 p-0 cursor-pointer" style={{ pointerEvents: 'auto' }}>
              {t('SHOP_NOW')}
            </button>
          </Link>
        </motion.div>
      </div>
      {/* Swiper pagination dots will appear below the slider by default, but we can style them */}
      <style>{`
        .hero-swiper .swiper-pagination {
          position: absolute;
          bottom: 24px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 20;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.7;
          width: 16px;
          height: 16px;
          margin: 0 8px;
          border-radius: 50%;
          border: 2px solid #000;
          transition: background 0.3s, opacity 0.3s, transform 0.3s;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #000;
          opacity: 1;
          transform: scale(1.2);
          border-color: #fff;
        }
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: #fff;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          top: 50%;
          transform: translateY(-50%);
        }
        .hero-swiper .swiper-button-next:after,
        .hero-swiper .swiper-button-prev:after {
          font-size: 22px;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
};

export default HeroImage; 