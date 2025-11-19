import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { courseAPI, enrollmentAPI } from '../lib/api';
import type { Course, Lesson, Enrollment } from '../types/course';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoPlayCircle,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoList,
  IoClose,
  IoTimeOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
  IoExpand,
  IoContract,
} from 'react-icons/io5';

export const LessonPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: `/learn/${courseId}/${lessonId}` } });
    }
  }, [user, authLoading, navigate, courseId, lessonId]);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseAndEnrollment();
    }
  }, [user, courseId]);

  useEffect(() => {
    if (course && lessonId) {
      const index = course.lessons.findIndex(
        (l) => l._id === lessonId || `lesson-${course.lessons.indexOf(l)}` === lessonId
      );
      if (index !== -1) {
        setCurrentLessonIndex(index);
        setCurrentLesson(course.lessons[index]);
      }
    }
  }, [course, lessonId]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (enrollment && currentLesson && isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        saveProgress();
      }, 10000);
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [enrollment, currentLesson, isPlaying, currentTime]);

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, enrollmentsRes] = await Promise.all([
        courseAPI.getCourseById(courseId!),
        enrollmentAPI.getMyEnrollments(),
      ]);

      const courseData = courseRes.data.data.course;
      setCourse(courseData);

      // Find enrollment for this course
      const enrollmentData = enrollmentsRes.data.data.enrollments.find(
        (e: Enrollment) =>
          (typeof e.courseId === 'string' ? e.courseId : e.courseId._id) === courseId
      );

      if (!enrollmentData) {
        setError('이 강의에 대한 수강 권한이 없습니다.');
        return;
      }

      setEnrollment(enrollmentData);
    } catch (err: any) {
      setError(err.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async () => {
    if (!enrollment || !currentLesson) return;

    try {
      const lessonIdToSave = currentLesson._id || `lesson-${currentLessonIndex}`;
      const isCompleted = duration > 0 && currentTime / duration >= 0.9; // 90% watched = completed

      await enrollmentAPI.updateProgress(enrollment._id, {
        lessonId: lessonIdToSave,
        completed: isCompleted,
        watchDuration: Math.floor(currentTime),
      });

      // Update local enrollment state
      if (isCompleted) {
        setEnrollment((prev) => {
          if (!prev) return prev;
          const updatedProgress = prev.progress.map((p) =>
            p.lessonId === lessonIdToSave ? { ...p, completed: true } : p
          );
          const completedCount = updatedProgress.filter((p) => p.completed).length;
          return {
            ...prev,
            progress: updatedProgress,
            completionPercentage: Math.round((completedCount / updatedProgress.length) * 100),
          };
        });
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [enrollment, currentLesson, currentLessonIndex, currentTime, duration]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToLesson = (index: number) => {
    if (!course) return;
    saveProgress(); // Save current progress before switching

    const lesson = course.lessons[index];
    const lessonIdParam = lesson._id || `lesson-${index}`;
    navigate(`/learn/${courseId}/${lessonIdParam}`);
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      goToLesson(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (course && currentLessonIndex < course.lessons.length - 1) {
      goToLesson(currentLessonIndex + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLessonCompleted = (index: number) => {
    if (!enrollment || !course) return false;
    const lesson = course.lessons[index];
    const lessonIdCheck = lesson._id || `lesson-${index}`;
    const progress = enrollment.progress.find((p) => p.lessonId === lessonIdCheck);
    return progress?.completed || false;
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 max-w-md text-center"
          >
            <p className="text-red-500 font-semibold mb-2">오류 발생</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/my-courses')}>나의 강의실로</Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'lg:mr-80' : ''}`}>
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <IoChevronBack className="w-5 h-5" />
            <span className="hidden sm:inline">{course.title}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              {showSidebar ? <IoClose className="w-5 h-5" /> : <IoList className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          <div
            id="video-container"
            className="relative bg-black aspect-video max-h-[70vh] mx-auto w-full"
          >
            {currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  saveProgress();
                  if (course && currentLessonIndex < course.lessons.length - 1) {
                    goToNextLesson();
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <IoPlayCircle className="w-16 h-16 mx-auto mb-4" />
                  <p>영상이 준비되지 않았습니다</p>
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-3"
                style={{
                  background: `linear-gradient(to right, #F5B800 0%, #F5B800 ${
                    (currentTime / duration) * 100 || 0
                  }%, #4B5563 ${(currentTime / duration) * 100 || 0}%, #4B5563 100%)`,
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-brand-yellow transition-colors"
                  >
                    {isPlaying ? (
                      <IoPauseOutline className="w-8 h-8" />
                    ) : (
                      <IoPlayOutline className="w-8 h-8" />
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-brand-yellow transition-colors"
                    >
                      {isMuted ? (
                        <IoVolumeMuteOutline className="w-6 h-6" />
                      ) : (
                        <IoVolumeHighOutline className="w-6 h-6" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hidden sm:block"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Playback Speed */}
                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                    className="bg-transparent text-white text-sm border border-gray-600 rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-brand-yellow transition-colors"
                  >
                    {isFullscreen ? (
                      <IoContract className="w-6 h-6" />
                    ) : (
                      <IoExpand className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info & Navigation */}
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {currentLessonIndex + 1}. {currentLesson.title}
              </h1>
              {currentLesson.description && (
                <p className="text-gray-400 mb-4">{currentLesson.description}</p>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                  icon={<IoChevronBack />}
                >
                  이전 강의
                </Button>

                <span className="text-gray-400 text-sm">
                  {currentLessonIndex + 1} / {course.lessons.length}
                </span>

                <Button
                  variant="yellow"
                  onClick={goToNextLesson}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                >
                  다음 강의
                  <IoChevronForward className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Lesson List */}
      <div
        className={`fixed lg:static right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform ${
          showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:hidden'
        } z-50 lg:z-auto overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-white">강의 목록</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {enrollment && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">전체 진행률</span>
              <span className="font-bold text-brand-yellow">
                {enrollment.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-brand-yellow"
                style={{ width: `${enrollment.completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-2">
          {course.lessons.map((lesson, index) => {
            const isActive = index === currentLessonIndex;
            const completed = isLessonCompleted(index);

            return (
              <button
                key={lesson._id || index}
                onClick={() => goToLesson(index)}
                className={`w-full p-3 rounded-lg text-left mb-1 transition-colors ${
                  isActive
                    ? 'bg-brand-yellow/20 border border-brand-yellow'
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {completed ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    ) : isActive ? (
                      <IoPlayCircle className="w-5 h-5 text-brand-yellow" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? 'text-brand-yellow' : 'text-white'
                      }`}
                    >
                      {index + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <IoTimeOutline className="w-3 h-3" />
                      <span>{lesson.duration}분</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};
