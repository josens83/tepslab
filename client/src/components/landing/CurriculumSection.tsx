import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';
import { motion } from 'framer-motion';

interface CurriculumButton {
  score: string;
  label: string;
  color: string;
  hoverColor: string;
  href: string;
}

const curriculumButtons: CurriculumButton[] = [
  {
    score: '327점',
    label: '맞춤형 커리큘럼',
    color: 'bg-brand-yellow',
    hoverColor: 'hover:bg-yellow-500',
    href: '/courses/327',
  },
  {
    score: '387점',
    label: '맞춤형 커리큘럼',
    color: 'bg-brand-purple',
    hoverColor: 'hover:bg-purple-600',
    href: '/courses/387',
  },
  {
    score: '450점',
    label: '맞춤형 커리큘럼',
    color: 'bg-brand-pink',
    hoverColor: 'hover:bg-pink-600',
    href: '/courses/450',
  },
  {
    score: '550점',
    label: '맞춤형 커리큘럼',
    color: 'bg-brand-cyan',
    hoverColor: 'hover:bg-cyan-500',
    href: '/courses/550',
  },
];

export const CurriculumSection: React.FC = () => {
  return (
    <section className="bg-black text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Curriculum Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
          {curriculumButtons.map((button, index) => (
            <motion.div
              key={button.score}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                to={button.href}
                className={`
                  ${button.color} ${button.hoverColor}
                  text-black font-bold text-lg md:text-xl
                  px-8 py-6 rounded-full
                  flex items-center justify-center gap-2
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-2xl
                `}
              >
                <span>{button.score} {button.label}</span>
                <IoArrowForward className="w-5 h-5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No Base Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl mb-6 font-medium">
            영어 기초가 없다면?
          </p>
          <Link
            to="/courses/nobase"
            className="
              bg-brand-green hover:bg-green-600
              text-white font-bold text-lg md:text-xl
              px-8 py-6 rounded-full
              inline-flex items-center justify-center gap-2
              transition-all duration-300
              hover:scale-105 active:scale-95
              shadow-lg hover:shadow-2xl
              max-w-md
            "
          >
            <span>노베이스 탈출 커리큘럼</span>
            <IoArrowForward className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
