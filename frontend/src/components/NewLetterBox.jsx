import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from 'emailjs-com';
import { useTranslation } from 'react-i18next';

const SERVICE_ID = 'service_2xwqrpt'; // Replace with your EmailJS service ID
const TEMPLATE_ID = 'template_l82of3z'; // Replace with your EmailJS template ID
const PUBLIC_KEY = 'WANwSLs9otwlMWH-H'; // Replace with your EmailJS public key

const NewLetterBox = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const { t } = useTranslation();

  const onSubmitHanndler = (event) => {
    event.preventDefault();
    setStatus("");
    emailjs.send(SERVICE_ID, TEMPLATE_ID, { user_email: email }, PUBLIC_KEY)
      .then(() => {
        setStatus(t('NEWSLETTER_SUCCESS'));
        setEmail("");
      })
      .catch(() => {
        setStatus(t('NEWSLETTER_FAIL'));
      });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={itemVariants}
      className="text-center my-20">
      <p className="text-2xl font-medium text-gray-800">
        {t('NEWSLETTER_TITLE')}
      </p>
      <p className="text-gray-400 mt-4">
        {t('NEWSLETTER_DESC')}
      </p>
      <form
        onSubmit={onSubmitHanndler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-300 pl-3"
      >
        <input
          className="w-full sm:flex-1 outline-none"
          type="email"
          placeholder={t('NEWSLETTER_PLACEHOLDER')}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4"
        >
          {t('NEWSLETTER_SUBSCRIBE')}
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-green-600">{status}</p>}
    </motion.div>
  );
};

export default NewLetterBox;
