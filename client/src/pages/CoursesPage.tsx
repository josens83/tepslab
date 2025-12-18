import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { CourseCard, CourseFilters } from '../components/course';
import { SEO } from '../components/common';
import { courseAPI } from '../lib/api';
import type { Course, CourseFilters as Filters } from '../types/course';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { generateBreadcrumbSchema } from '../utils/seo';

const COURSES_PER_PAGE = 12;

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<Filters>({
    sort: '-createdAt',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, [filters, currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        limit: COURSES_PER_PAGE,
      };

      if (filters.targetScore) params.targetScore = filters.targetScore;
      if (filters.level) params.level = filters.level;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;

      const response = await courseAPI.getCourses(params);
      const { courses: fetchedCourses, total, totalPages: pages } = response.data.data;

      setCourses(fetchedCourses);
      setTotalCourses(total);
      setTotalPages(pages);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '강의를 불러오는데 실패했습니다.');
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleReset = () => {
    setFilters({ sort: '-createdAt' });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { name: '홈', url: '/' },
    { name: '전체 강의', url: '/courses' },
  ];

  return (
    <MainLayout>
      <SEO
        title="전체 강의"
        description={`TEPS Lab의 모든 강의를 확인하세요. 문법, 어휘, 청취, 독해 영역별 강의와 점수대별 맞춤 과정을 제공합니다. 현재 ${totalCourses}개의 강의가 있습니다.`}
        keywords="TEPS 강의, 텝스 강의 목록, 문법 강의, 어휘 강의, 청취 강의, 독해 강의, 327점, 387점, 450점, 550점"
        canonical="/courses"
        jsonLd={generateBreadcrumbSchema(breadcrumbs)}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              TEPS 강의
            </h1>
            <p className="text-gray-600">
              목표 점수에 맞는 최적의 강의를 찾아보세요
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <CourseFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </motion.div>

            {/* Course Grid */}
            <div className="lg:col-span-3">
              {/* Results Info */}
              {!loading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 flex items-center justify-between"
                >
                  <p className="text-gray-600">
                    총 <span className="font-bold text-brand-yellow">{totalCourses}</span>개의
                    강의
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentPage} / {totalPages} 페이지
                  </p>
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
                    <p className="text-gray-600">강의를 불러오는 중...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
                >
                  <p className="text-red-600 font-semibold mb-2">오류 발생</p>
                  <p className="text-red-500 text-sm">{error}</p>
                  <button
                    onClick={fetchCourses}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && !error && courses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-md p-12 text-center"
                >
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    다른 필터 조건으로 다시 검색해보세요
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    필터 초기화
                  </button>
                </motion.div>
              )}

              {/* Course Grid */}
              {!loading && !error && courses.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
                  >
                    {courses.map((course, index) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CourseCard course={course} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <IoChevronBack className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            // Show first page, last page, current page, and adjacent pages
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsisBefore =
                              index > 0 && page - array[index - 1] > 1;

                            return (
                              <React.Fragment key={page}>
                                {showEllipsisBefore && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`min-w-[40px] h-10 rounded-lg font-semibold transition-colors ${
                                    currentPage === page
                                      ? 'bg-brand-yellow text-black'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <IoChevronForward className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
