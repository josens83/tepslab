// JSON-LD Schema Generator Utilities

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl?: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewsCount?: number;
  duration?: number;
}

interface Review {
  _id: string;
  userId: {
    name: string;
  };
  rating: number;
  comment: string;
  beforeScore?: number;
  afterScore?: number;
  createdAt: string;
}

/**
 * Generate Organization Schema
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'TEPS Lab',
    alternateName: '텝스랩',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: '/logo.png',
    description: '점수대별 맞춤 TEPS 학습 플랫폼',
    sameAs: [
      'https://www.facebook.com/tepslab',
      'https://www.instagram.com/tepslab',
      'https://www.youtube.com/tepslab',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-2-1234-5678',
      contactType: 'Customer Service',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
  };
};

/**
 * Generate Course Schema
 */
export const generateCourseSchema = (course: Course) => {
  const price = course.discountPrice || course.price;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'TEPS Lab',
      sameAs: typeof window !== 'undefined' ? window.location.origin : '',
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor,
    },
    image: course.thumbnailUrl || '/default-course.png',
    aggregateRating: course.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewsCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url:
        typeof window !== 'undefined'
          ? `${window.location.origin}/courses/${course._id}`
          : '',
    },
    ...(course.duration && {
      timeRequired: `PT${course.duration}H`,
    }),
  };
};

/**
 * Generate Review Schema
 */
export const generateReviewSchema = (review: Review, courseTitle: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Course',
      name: courseTitle,
    },
    author: {
      '@type': 'Person',
      name: review.userId.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.comment,
    datePublished: review.createdAt,
  };
};

/**
 * Generate BreadcrumbList Schema
 */
export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: typeof window !== 'undefined' ? window.location.origin + item.url : item.url,
    })),
  };
};

/**
 * Generate WebSite Schema with SearchAction
 */
export const generateWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TEPS Lab',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          typeof window !== 'undefined'
            ? `${window.location.origin}/courses?search={search_term_string}`
            : '',
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

/**
 * Generate FAQ Schema
 */
export const generateFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
