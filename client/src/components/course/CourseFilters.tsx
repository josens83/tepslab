import React from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';
import type { CourseFilters as Filters } from '../../types/course';

interface CourseFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleChange = (key: keyof Filters, value: Filters[keyof Filters]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.targetScore ||
    filters.level ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">강의 필터</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-brand-yellow flex items-center gap-1"
          >
            <IoClose className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="강의명, 설명 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Target Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목표 점수
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[327, 387, 450, 550, 600].map((score) => (
              <button
                key={score}
                onClick={() =>
                  handleChange(
                    'targetScore',
                    filters.targetScore === score ? undefined : score
                  )
                }
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  filters.targetScore === score
                    ? 'bg-brand-yellow text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {score}점
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            난이도
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'beginner', label: '초급' },
              { value: 'intermediate', label: '중급' },
              { value: 'advanced', label: '고급' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() =>
                  handleChange(
                    'level',
                    filters.level === value ? undefined : value
                  )
                }
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  filters.level === value
                    ? 'bg-brand-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              handleChange('category', e.target.value || undefined)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="">전체</option>
            <option value="grammar">문법</option>
            <option value="vocabulary">어휘</option>
            <option value="listening">듣기</option>
            <option value="reading">독해</option>
            <option value="comprehensive">종합</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            가격 범위
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) =>
                handleChange(
                  'minPrice',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="최소 가격"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleChange(
                  'maxPrice',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="최대 가격"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬
          </label>
          <select
            value={filters.sort || '-createdAt'}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="-createdAt">최신순</option>
            <option value="-enrolledCount">인기순</option>
            <option value="-rating">평점순</option>
            <option value="price">가격 낮은순</option>
            <option value="-price">가격 높은순</option>
          </select>
        </div>
      </div>
    </div>
  );
};
