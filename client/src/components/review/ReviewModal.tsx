import React, { useState, useEffect } from 'react';
import { Modal, Button, Textarea } from '../common';
import { reviewAPI } from '../../lib/api';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import type { Review } from '../../types/review';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  existingReview?: Review;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  existingReview,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [beforeScore, setBeforeScore] = useState<number | ''>('');
  const [afterScore, setAfterScore] = useState<number | ''>('');
  const [studyDuration, setStudyDuration] = useState<number | ''>('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title);
      setComment(existingReview.comment);
      setBeforeScore(existingReview.beforeScore || '');
      setAfterScore(existingReview.afterScore || '');
      setStudyDuration(existingReview.studyDuration || '');
    } else {
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      setBeforeScore('');
      setAfterScore('');
      setStudyDuration('');
    }
    setError(null);
  }, [existingReview, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (comment.length < 10) {
      setError('후기는 10자 이상 작성해주세요.');
      setLoading(false);
      return;
    }

    try {
      const data = {
        courseId,
        rating,
        title,
        comment,
        beforeScore: beforeScore !== '' ? Number(beforeScore) : undefined,
        afterScore: afterScore !== '' ? Number(afterScore) : undefined,
        studyDuration: studyDuration !== '' ? Number(studyDuration) : undefined,
      };

      if (existingReview) {
        await reviewAPI.updateReview(existingReview._id, data);
      } else {
        await reviewAPI.createReview(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '후기 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingReview ? '후기 수정' : '후기 작성'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">강의</p>
          <p className="font-semibold text-gray-900">{courseTitle}</p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            평점
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl focus:outline-none"
              >
                {star <= (hoverRating || rating) ? (
                  <IoStar className="text-brand-yellow" />
                ) : (
                  <IoStarOutline className="text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-2 text-lg font-bold text-gray-900">{rating}점</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="후기 제목을 입력해주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            후기 내용
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="수강 후기를 자세히 작성해주세요 (최소 10자)"
            rows={5}
            fullWidth
            required
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}자</p>
        </div>

        {/* Score Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            점수 변화 (선택사항)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">수강 전 점수</label>
              <input
                type="number"
                value={beforeScore}
                onChange={(e) => setBeforeScore(e.target.value ? Number(e.target.value) : '')}
                placeholder="0~600"
                min={0}
                max={600}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">수강 후 점수</label>
              <input
                type="number"
                value={afterScore}
                onChange={(e) => setAfterScore(e.target.value ? Number(e.target.value) : '')}
                placeholder="0~600"
                min={0}
                max={600}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">학습 기간(일)</label>
              <input
                type="number"
                value={studyDuration}
                onChange={(e) => setStudyDuration(e.target.value ? Number(e.target.value) : '')}
                placeholder="일"
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="yellow"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {existingReview ? '수정하기' : '작성하기'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
