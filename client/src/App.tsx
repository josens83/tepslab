import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Modal,
  ModalFooter,
  LoadingSpinner,
  ToastContainer,
  Logo,
  PWAInstallPrompt,
} from './components/common';
import { useToast } from './hooks/useToast';
import { IoMail, IoSearch } from 'react-icons/io5';
import { LayoutDemo } from './pages/LayoutDemo';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallback } from './pages/AuthCallback';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutFailPage } from './pages/CheckoutFailPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { ProfilePage } from './pages/ProfilePage';
import { DiagnosticTestPage } from './pages/DiagnosticTestPage';
import { TestResultPage } from './pages/TestResultPage';

// Component Library Demo Page
function ComponentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, removeToast, success, error, info, warning } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg p-8">
          <Logo size="lg" />
          <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-2">
            컴포넌트 라이브러리
          </h1>
          <p className="text-gray-600">
            프리미엄 학습 플랫폼의 공통 컴포넌트 데모
          </p>
          <div className="mt-6 flex gap-4">
            <Link to="/">
              <Button variant="yellow" size="lg">
                랜딩 페이지 보기
              </Button>
            </Link>
            <Link to="/layout">
              <Button variant="purple" size="lg">
                레이아웃 데모 보기
              </Button>
            </Link>
          </div>
        </header>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Logo 컴포넌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Small</p>
                  <Logo size="sm" clickable={false} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Medium</p>
                  <Logo size="md" clickable={false} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Large</p>
                  <Logo size="lg" clickable={false} />
                </div>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <p className="text-sm text-white mb-2">White Variant</p>
                <Logo variant="white" clickable={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Section */}
        <Card>
          <CardHeader>
            <CardTitle>Button 컴포넌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Color Variants */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Color Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="yellow">Yellow Button</Button>
                  <Button variant="purple">Purple Button</Button>
                  <Button variant="pink">Pink Button</Button>
                  <Button variant="cyan">Cyan Button</Button>
                  <Button variant="green">Green Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  States
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading>
                    Loading Button
                  </Button>
                  <Button disabled>Disabled Button</Button>
                  <Button icon={<IoMail />}>With Icon</Button>
                </div>
              </div>

              {/* Full Width */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Full Width
                </h3>
                <Button fullWidth variant="purple">
                  Full Width Button
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input 컴포넌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                label="이메일"
                type="email"
                placeholder="example@email.com"
                fullWidth
              />
              <Input
                label="비밀번호"
                type="password"
                placeholder="••••••••"
                helperText="8자 이상 입력해주세요"
                fullWidth
              />
              <Input
                label="검색"
                type="text"
                placeholder="강의 검색..."
                leftIcon={<IoSearch />}
                fullWidth
              />
              <Input
                label="에러 상태"
                type="text"
                error="올바른 형식이 아닙니다"
                fullWidth
              />
              <Textarea
                label="후기 작성"
                placeholder="수강 후기를 남겨주세요..."
                helperText="최소 10자 이상 작성해주세요"
                rows={6}
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal & Toast Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modal & Toast 컴포넌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setIsModalOpen(true)}>
                  모달 열기
                </Button>
                <Button variant="green" onClick={() => success('성공!')}>
                  Success Toast
                </Button>
                <Button variant="pink" onClick={() => error('에러 발생!')}>
                  Error Toast
                </Button>
                <Button variant="cyan" onClick={() => info('정보 알림')}>
                  Info Toast
                </Button>
                <Button variant="purple" onClick={() => warning('경고!')}>
                  Warning Toast
                </Button>
              </div>

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="모달 제목"
              >
                <div className="space-y-4">
                  <p>모달 컨텐츠가 여기에 표시됩니다.</p>
                  <Input label="이름" fullWidth />
                  <Textarea label="메시지" fullWidth rows={4} />
                </div>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    확인
                  </Button>
                </ModalFooter>
              </Modal>
            </div>
          </CardContent>
        </Card>

        {/* Loading Spinner Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinner 컴포넌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Small</p>
                  <LoadingSpinner size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Medium</p>
                  <LoadingSpinner size="md" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Large</p>
                  <LoadingSpinner size="lg" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8">
                <LoadingSpinner color="yellow" text="로딩 중..." />
                <LoadingSpinner color="purple" text="처리 중..." />
                <LoadingSpinner color="green" text="저장 중..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/fail" element={<CheckoutFailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LessonPlayerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test/:id" element={<DiagnosticTestPage />} />
        <Route path="/test/result/:id" element={<TestResultPage />} />
        <Route path="/components" element={<ComponentDemo />} />
        <Route path="/layout/*" element={<LayoutDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
