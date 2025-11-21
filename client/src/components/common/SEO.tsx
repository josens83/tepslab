import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  jsonLd?: object;
  noindex?: boolean;
}

const SEO = ({
  title,
  description = 'TEPS Lab - 점수대별 맞춤 TEPS 학습 플랫폼. 327점, 387점, 450점, 550점 목표별 커리큘럼으로 효율적인 텝스 학습을 시작하세요.',
  keywords = 'TEPS, 텝스, 텝스 학습, TEPS 강의, 텝스 인강, 영어 시험, 327점, 387점, 450점, 550점, 온라인 강의',
  ogType = 'website',
  ogImage = '/og-image.png',
  ogUrl,
  canonical,
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const siteTitle = 'TEPS Lab';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="author" content="TEPS Lab" />
      <meta name="theme-color" content="#0891B2" />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
