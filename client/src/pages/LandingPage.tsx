import React from 'react';
import { MainLayout } from '../components/layout';
import {
  TopBanner,
  HeroSection,
  CurriculumSection,
  ReviewsSection,
} from '../components/landing';
import { SEO } from '../components/common';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
} from '../utils/seo';

export const LandingPage: React.FC = () => {
  const faqs = [
    {
      question: 'TEPS Lab은 어떤 서비스인가요?',
      answer:
        'TEPS Lab은 점수대별 맞춤 커리큘럼을 제공하는 프리미엄 TEPS 학습 플랫폼입니다. 327점, 387점, 450점, 550점 등 목표 점수에 따라 최적화된 강의를 제공합니다.',
    },
    {
      question: '어떤 강의 과정이 있나요?',
      answer:
        '문법, 어휘, 청취, 독해 영역별 강의와 점수대별 종합 과정이 있습니다. 초보자를 위한 노베이스 과정부터 고득점을 위한 550점 과정까지 다양합니다.',
    },
    {
      question: '강의는 어떻게 수강하나요?',
      answer:
        '회원가입 후 원하는 강의를 선택하여 결제하면 바로 수강할 수 있습니다. PC, 모바일, 태블릿 모든 기기에서 학습 가능합니다.',
    },
    {
      question: '환불은 가능한가요?',
      answer:
        '강의 시청 전이라면 전액 환불이 가능합니다. 부분 시청 후에는 시청한 강의를 제외한 금액을 환불받을 수 있습니다.',
    },
  ];

  const jsonLd = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateFAQSchema(faqs),
  ];

  return (
    <>
      <SEO
        title="TEPS, 필요한 점수만큼만 공부하세요"
        description="점수대별 맞춤 TEPS 학습 플랫폼. 327점, 387점, 450점, 550점 목표별 커리큘럼으로 효율적인 텝스 학습을 시작하세요. 전문 강사진과 함께하는 프리미엄 온라인 강의."
        keywords="TEPS, 텝스, 텝스 학습, TEPS 강의, 텝스 인강, 영어 시험, 327점, 387점, 450점, 550점, 온라인 강의, 텝스랩, TEPS Lab"
        ogType="website"
        ogImage="/og-landing.png"
        jsonLd={jsonLd}
      />
      <TopBanner />
      <MainLayout showFooter={true}>
        <HeroSection />
        <CurriculumSection />
        <ReviewsSection />
      </MainLayout>
    </>
  );
};
