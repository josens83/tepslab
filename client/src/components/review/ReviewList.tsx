import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import { reviewAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { ReviewModal } from './ReviewModal';
import { motion } from 'framer-motion';
import {
  IoStar,
  IoStarHalf,
  IoStarOutline,
  IoThumbsUp,
  IoTrendingUp,
  IoPencil,
  IoTrash,
} from 'react-icons/io5';
import type { Review, RatingDistribution } from '../../types/review';

interface ReviewListProps {
  courseId: string;
  courseTitle: string;
  isEnrolled: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  courseId,
  courseTitle,
  isEnrolled,
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getCourseReviews(courseId, { page, limit: 5 });
      setReviews(response.data.data.reviews);
      setRatingDistribution(response.data.data.ratingDistribution);
      setTotalPages(response.data.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId, page]);

  const handleHelpful = async (reviewId: string) => {
    try {
      await reviewAPI.markHelpful(reviewId);
      fetchReviews();
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('후기를 삭제하시겠습니까?')) return;

    try {
      await reviewAPI.deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingReview(undefined);
    setIsModalOpen(true);
  };

  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  const averageRating =
    totalReviews > 0
      ? (
          Object.entries(ratingDistribution).reduce(
            (acc, [rating, count]) => acc + Number(rating) * count,
            0
          ) / totalReviews
        ).toFixed(1)
      : '0.0';

  const userHasReview = reviews.some((r) => r.userId._id === user?._id);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<IoStar key={i} className="text-brand-yellow" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<IoStarHalf key={i} className="text-brand-yellow" />);
      } else {
        stars.push(<IoStarOutline key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">수강 후기</h2>
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(Number(averageRating))}</div>
            <span className="text-lg font-bold">{averageRating}</span>
            <span className="text-gray-500">({totalReviews}개)</span>
          </div>
        </div>

        {isEnrolled && !userHasReview && (
          <Button variant="yellow" onClick={handleCreate}>
            후기 작성하기
          </Button>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-5 gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof RatingDistribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={rating} className="text-center">
                <div className="text-sm text-gray-600 mb-1">{rating}점</div>
                <div className="h-16 bg-gray-200 rounded-full relative overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-brand-yellow rounded-full"
                    style={{ height: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">아직 후기가 없습니다</p>
          {isEnrolled && (
            <p className="text-sm text-gray-400 mt-2">
              첫 번째 후기를 작성해보세요!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {review.userId.name}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        수강인증
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-sm">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>

                {user?._id === review.userId._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <IoPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <IoTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>

              {/* Score Change */}
              {review.beforeScore && review.afterScore && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <IoTrendingUp className="text-green-500" />
                  <span className="text-gray-600">점수 변화:</span>
                  <span className="font-semibold">
                    {review.beforeScore}점 → {review.afterScore}점
                  </span>
                  <span className="text-green-500 font-bold">
                    (+{review.afterScore - review.beforeScore}점)
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-yellow"
                >
                  <IoThumbsUp className="w-4 h-4" />
                  <span>도움됨 ({review.helpfulCount})</span>
                </button>

                {review.studyDuration && (
                  <span className="text-xs text-gray-400">
                    학습 기간: {review.studyDuration}일
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReview(undefined);
        }}
        courseId={courseId}
        courseTitle={courseTitle}
        existingReview={editingReview}
        onSuccess={fetchReviews}
      />
    </div>
  );
};
