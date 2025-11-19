import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoStar, IoPeople, IoTime, IoBookmark } from 'react-icons/io5';
import type { Course } from '../../types/course';

interface CourseCardProps {
  course: Course;
}

const targetScoreColors: Record<number, string> = {
  327: 'bg-brand-yellow',
  387: 'bg-brand-purple',
  450: 'bg-brand-pink',
  550: 'bg-brand-cyan',
  600: 'bg-brand-green',
};

const levelLabels: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const categoryLabels: Record<string, string> = {
  grammar: '문법',
  vocabulary: '어휘',
  listening: '듣기',
  reading: '독해',
  comprehensive: '종합',
};

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const discountPercentage = course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link to={`/courses/${course._id}`}>
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoBookmark className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Target Score Badge */}
            <div
              className={`absolute top-3 left-3 ${
                targetScoreColors[course.targetScore]
              } text-black font-bold px-3 py-1 rounded-full text-sm`}
            >
              {course.targetScore}점 목표
            </div>

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category & Level */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-brand-purple bg-purple-50 px-2 py-1 rounded">
                {categoryLabels[course.category]}
              </span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {levelLabels[course.level]}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-yellow transition-colors">
              {course.title}
            </h3>

            {/* Instructor */}
            <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <IoStar className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{course.rating.toFixed(1)}</span>
                <span>({course.reviewsCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <IoPeople className="w-4 h-4" />
                <span>{course.enrolledCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <IoTime className="w-4 h-4" />
                <span>{course.duration}시간</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                {course.discountPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-brand-yellow">
                      {course.discountPrice.toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {course.price.toLocaleString()}원
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    {course.price.toLocaleString()}원
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {course.lessonsCount}개 강의
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
