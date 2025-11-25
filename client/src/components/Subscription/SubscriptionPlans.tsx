import React, { useState } from 'react';
import './SubscriptionPlans.css';

interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    maxCourses: number;
    maxAIRequests: number;
    maxUploads: number;
    prioritySupport: boolean;
    offlineAccess: boolean;
    certificatesEnabled: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  description: string;
  popular?: boolean;
}

const tiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: {
      maxCourses: 3,
      maxAIRequests: 10,
      maxUploads: 20,
      prioritySupport: false,
      offlineAccess: false,
      certificatesEnabled: false,
      customBranding: false,
      apiAccess: false,
    },
    description: 'Perfect for getting started',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 9900, yearly: 99000 },
    features: {
      maxCourses: 20,
      maxAIRequests: 100,
      maxUploads: 200,
      prioritySupport: false,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: false,
      apiAccess: false,
    },
    description: 'For serious learners',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 29900, yearly: 299000 },
    features: {
      maxCourses: -1,
      maxAIRequests: 500,
      maxUploads: 1000,
      prioritySupport: true,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: false,
      apiAccess: true,
    },
    description: 'For power users',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 99900, yearly: 999000 },
    features: {
      maxCourses: -1,
      maxAIRequests: -1,
      maxUploads: -1,
      prioritySupport: true,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: true,
      apiAccess: true,
    },
    description: 'For teams and organizations',
  },
];

interface SubscriptionPlansProps {
  currentTier?: string;
  onUpgrade?: (tier: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentTier = 'free',
  onUpgrade,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribe = (tierId: string) => {
    if (onUpgrade) {
      onUpgrade(tierId, billingCycle);
    }
  };

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your learning journey</p>

        <div className="billing-toggle">
          <button
            className={billingCycle === 'monthly' ? 'active' : ''}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={billingCycle === 'yearly' ? 'active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="badge">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="plans-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`plan-card ${tier.popular ? 'popular' : ''} ${
              currentTier === tier.id ? 'current' : ''
            }`}
          >
            {tier.popular && <div className="popular-badge">Most Popular</div>}
            {currentTier === tier.id && <div className="current-badge">Current Plan</div>}

            <div className="plan-header">
              <h2>{tier.name}</h2>
              <p className="description">{tier.description}</p>
              <div className="price">
                <span className="amount">
                  {formatPrice(tier.price[billingCycle])}
                </span>
                <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {billingCycle === 'yearly' && tier.price.yearly > 0 && (
                <p className="savings">
                  Save {formatPrice(tier.price.monthly * 12 - tier.price.yearly)} per year
                </p>
              )}
            </div>

            <div className="plan-features">
              <ul>
                <li className={tier.features.maxCourses > 0 || tier.features.maxCourses === -1 ? 'included' : 'excluded'}>
                  <span className="icon">
                    {tier.features.maxCourses > 0 || tier.features.maxCourses === -1 ? '✓' : '✗'}
                  </span>
                  {tier.features.maxCourses === -1 ? 'Unlimited' : tier.features.maxCourses} courses
                </li>
                <li className={tier.features.maxAIRequests > 0 || tier.features.maxAIRequests === -1 ? 'included' : 'excluded'}>
                  <span className="icon">
                    {tier.features.maxAIRequests > 0 || tier.features.maxAIRequests === -1 ? '✓' : '✗'}
                  </span>
                  {tier.features.maxAIRequests === -1 ? 'Unlimited' : tier.features.maxAIRequests} AI requests/hour
                </li>
                <li className={tier.features.maxUploads > 0 || tier.features.maxUploads === -1 ? 'included' : 'excluded'}>
                  <span className="icon">
                    {tier.features.maxUploads > 0 || tier.features.maxUploads === -1 ? '✓' : '✗'}
                  </span>
                  {tier.features.maxUploads === -1 ? 'Unlimited' : tier.features.maxUploads} uploads/hour
                </li>
                <li className={tier.features.offlineAccess ? 'included' : 'excluded'}>
                  <span className="icon">{tier.features.offlineAccess ? '✓' : '✗'}</span>
                  Offline access
                </li>
                <li className={tier.features.certificatesEnabled ? 'included' : 'excluded'}>
                  <span className="icon">{tier.features.certificatesEnabled ? '✓' : '✗'}</span>
                  Certificates
                </li>
                <li className={tier.features.prioritySupport ? 'included' : 'excluded'}>
                  <span className="icon">{tier.features.prioritySupport ? '✓' : '✗'}</span>
                  Priority support
                </li>
                <li className={tier.features.apiAccess ? 'included' : 'excluded'}>
                  <span className="icon">{tier.features.apiAccess ? '✓' : '✗'}</span>
                  API access
                </li>
                <li className={tier.features.customBranding ? 'included' : 'excluded'}>
                  <span className="icon">{tier.features.customBranding ? '✓' : '✗'}</span>
                  Custom branding
                </li>
              </ul>
            </div>

            <div className="plan-action">
              {currentTier === tier.id ? (
                <button className="btn btn-current" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubscribe(tier.id)}
                >
                  {tier.price[billingCycle] === 0 ? 'Get Started' : 'Upgrade Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards, PayPal, and bank transfers for Korean accounts.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>We offer a 14-day free trial for Basic and Premium plans. No credit card required.</p>
          </div>
          <div className="faq-item">
            <h3>Can I change my plan later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
