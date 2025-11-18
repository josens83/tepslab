import React from 'react';
import { MainLayout } from '../components/layout';
import {
  TopBanner,
  HeroSection,
  CurriculumSection,
  ReviewsSection,
} from '../components/landing';

export const LandingPage: React.FC = () => {
  return (
    <>
      <TopBanner />
      <MainLayout showFooter={true}>
        <HeroSection />
        <CurriculumSection />
        <ReviewsSection />
      </MainLayout>
    </>
  );
};
