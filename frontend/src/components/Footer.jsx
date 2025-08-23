import React from "react";
import { assets } from "../assets/frontend_assets/assets";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 text-gray-600">
            {t('FOOTER_DESC')}
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">{t('COMPANY')}</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>{t('HOME')}</li>
            <li>{t('ABOUT_US')}</li>
            <li>{t('DELIVERY')}</li>
            <li>{t('PRIVACY_POLICY')}</li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">{t('GET_IN_TOUCH')}</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+1-000-000-0000</li>
            <li>ziad@gmail.com</li>
            {/* Icons If Exist */}
          </ul>
        </div>
      </div>
      <div>
        <hr className="border-gray-200" />
        <p className="py-5 text-sm text-center">
          {t('COPYRIGHT')}
        </p>
      </div>
    </div>
  );
};

export default Footer;
