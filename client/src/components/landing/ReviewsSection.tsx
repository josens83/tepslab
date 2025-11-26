import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowForward } from 'react-icons/io5';

interface Review {
  id: string;
  title: string;
  studentName: string;
  date: string;
  beforeScore: number;
  afterScore: number;
  category: '300' | '450' | '500';
}

// Sample review data
const reviews: Review[] = [
  {
    id: '1',
    title: '포기만 안하면 됩니다.',
    studentName: '양유성',
    date: '2024.03.20',
    beforeScore: 206,
    afterScore: 332,
    category: '300',
  },
  {
    id: '2',
    title: '3주간 공부하면 된다',
    studentName: '차은주',
    date: '2024.02.21',
    beforeScore: 177,
    afterScore: 364,
    category: '300',
  },
  {
    id: '3',
    title: '와이게 진짜 됩니다',
    studentName: '허도희',
    date: '2024.04.23',
    beforeScore: 290,
    afterScore: 365,
    category: '300',
  },
  {
    id: '4',
    title: '꼭 필요한 공부만 해서 효율 요한 점수+만 달성했습니다.',
    studentName: '윤여은',
    date: '2024.06.05',
    beforeScore: 285,
    afterScore: 337,
    category: '300',
  },
  {
    id: '5',
    title: '단기간 점수상승은 TepsLab',
    studentName: '문리더',
    date: '2024.03.07',
    beforeScore: 364,
    afterScore: 450,
    category: '450',
  },
  {
    id: '6',
    title: '한 달만에 470점 달성!',
    studentName: '남윤희',
    date: '2023.10.08',
    beforeScore: 306,
    afterScore: 470,
    category: '450',
  },
  {
    id: '7',
    title: '한달만에 목표점수 달성',
    studentName: '마킴아이',
    date: '2024.04.10',
    beforeScore: 235,
    afterScore: 439,
    category: '450',
  },
  {
    id: '8',
    title: '0→388→499',
    studentName: '안지연',
    date: '2023.09.15',
    beforeScore: 388,
    afterScore: 499,
    category: '450',
  },
  {
    id: '9',
    title: '축격에서 벗어나다',
    studentName: '박성민',
    date: '2024.07.09',
    beforeScore: 487,
    afterScore: 578,
    category: '500',
  },
  {
    id: '10',
    title: 'TepsLab으로 역대 합격',
    studentName: '김소희',
    date: '2024.02.14',
    beforeScore: 468,
    afterScore: 550,
    category: '500',
  },
  {
    id: '11',
    title: '540이 하게가기 아니었다',
    studentName: '조영민',
    date: '2024.01.09',
    beforeScore: 446,
    afterScore: 560,
    category: '500',
  },
  {
    id: '12',
    title: '두 달 만에 500점 벽 돌기',
    studentName: '김다빈',
    date: '2023.04.04',
    beforeScore: 451,
    afterScore: 545,
    category: '500',
  },
];

const categories = [
  { id: '300', label: '300점대' },
  { id: '450', label: '450점 이상' },
  { id: '500', label: '500점대 초고득점' },
] as const;

export const ReviewsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'300' | '450' | '500'>('300');

  const filteredReviews = reviews.filter(
    (review) => review.category === activeCategory
  );

  return (
    <section className="bg-black text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          매 시험 추가되는 점수 달성자
        </motion.h2>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-6 py-3 rounded-full font-bold text-base md:text-lg
                transition-all duration-300
                ${
                  activeCategory === category.id
                    ? 'bg-brand-yellow text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white text-black rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {review.title}
                  </h3>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{review.studentName}</span>
                    <span>{review.date}</span>
                  </div>

                  {/* Score Display */}
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-400 flex items-center justify-center">
                        <span className="text-xl font-bold">{review.beforeScore}</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Before</span>
                    </div>
                    <IoArrowForward className="w-6 h-6 text-brand-yellow" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-brand-yellow flex items-center justify-center bg-yellow-50">
                        <span className="text-xl font-bold">{review.afterScore}</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">After</span>
                    </div>
                  </div>
                </div>

                {/* Score Report Preview - Placeholder */}
                <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400">
                  <span className="text-sm">점수 성적표 이미지</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
            <span>더 많은 후기 보기</span>
            <IoArrowForward className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
