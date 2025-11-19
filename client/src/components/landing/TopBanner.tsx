import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';
import { motion } from 'framer-motion';

export const TopBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-brand-cyan text-black py-3 px-4"
    >
      <Link
        to="/reviews"
        className="max-w-7xl mx-auto flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="text-base md:text-lg font-bold">
          이번에 올라온 점수 달성 후기 보러가기
        </span>
        <IoArrowForward className="w-5 h-5" />
      </Link>
    </motion.div>
  );
};
