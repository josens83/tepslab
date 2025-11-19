import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { MainLayout, AdminLayout } from '../components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/common';

// Main Layout Demo
const MainLayoutDemo: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Main Layout 데모</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Header와 Footer가 포함된 기본 레이아웃입니다.
              </p>
              <div className="flex gap-3">
                <Link to="/admin-demo">
                  <Button variant="purple">관리자 레이아웃 보기</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">반응형 디자인</h3>
              <p className="text-gray-600 text-sm">
                모바일, 태블릿, 데스크톱 모두 지원
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">네비게이션 메뉴</h3>
              <p className="text-gray-600 text-sm">
                드롭다운 서브메뉴 포함
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">사용자 인증</h3>
              <p className="text-gray-600 text-sm">
                로그인/로그아웃 상태 관리
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// Admin Layout Demo
const AdminLayoutDemo: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
          <p className="text-gray-600">관리자 레이아웃 데모입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-3xl font-bold text-brand-yellow mb-2">1,234</h3>
              <p className="text-gray-600">전체 회원</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-3xl font-bold text-brand-purple mb-2">56</h3>
              <p className="text-gray-600">강의 수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-3xl font-bold text-brand-pink mb-2">789</h3>
              <p className="text-gray-600">수강 신청</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-3xl font-bold text-brand-green mb-2">₩12.3M</h3>
              <p className="text-gray-600">이번 달 매출</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>관리자 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                좌측 사이드바에서 다양한 관리 기능에 접근할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>대시보드: 전체 통계 및 주요 지표</li>
                <li>강의 관리: 강의 추가, 수정, 삭제</li>
                <li>회원 관리: 회원 정보 조회 및 관리</li>
                <li>결제 관리: 결제 내역 및 환불 처리</li>
                <li>통계: 상세 분석 및 리포트</li>
                <li>설정: 시스템 설정</li>
              </ul>
              <Link to="/">
                <Button variant="outline">메인 레이아웃으로 돌아가기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Layout Demo Router
export const LayoutDemo: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayoutDemo />} />
      <Route path="/admin-demo" element={<AdminLayoutDemo />} />
    </Routes>
  );
};
