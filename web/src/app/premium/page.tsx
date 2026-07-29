'use client';

import { Check, ShieldAlert, Award, Star, Compass } from 'lucide-react';
import { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0.00',
    description: 'Listen to standard music with occasional ad breaks.',
    benefits: ['Standard audio quality (160kbps)', 'Ad-supported streaming', 'Online playback only', 'Single active device stream'],
    badge: 'Current',
    buttonColor: 'bg-brandDarkGray text-brandWhite border border-brandHighlight',
  },
  {
    id: 'individual',
    name: 'Premium Individual',
    price: '$9.99',
    description: 'Perfect for solo listeners. Unlock lossless streaming.',
    benefits: ['Ultra High Audio Quality (320kbps Lossless)', 'Ad-free listening experience', 'Offline downloads on mobile', 'Unlimited skip actions', 'Listen-along collaborative rooms'],
    badge: 'Popular',
    buttonColor: 'bg-brandNeon text-brandBg hover:brightness-110 shadow-lg',
  },
  {
    id: 'family',
    name: 'Premium Family',
    price: '$14.99',
    description: 'Up to 6 accounts. Ideal for household music lovers.',
    benefits: ['6 independent premium accounts', 'Lossless audio output', 'Family mix playlist suggestions', 'Explicit filters configuration', 'Ad-free music stream'],
    badge: 'Best Value',
    buttonColor: 'bg-brandWhite text-brandBg hover:bg-neutral-200 shadow-lg',
  },
];

export default function PremiumPage() {
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubscribe = (planName: string) => {
    setSuccessMsg(`Redirecting to Stripe checkout for ${planName}...`);
    setTimeout(() => {
      setSuccessMsg(`Success! You have activated mock subscription for ${planName}.`);
    }, 1500);
  };

  return (
    <div className="p-8 pb-32 space-y-10 select-none text-brandWhite relative overflow-hidden">
      
      {/* Page Header */}
      <header className="flex flex-col items-center text-center max-w-xl mx-auto space-y-3 mt-4">
        <Award className="w-12 h-12 text-brandNeon animate-bounce" />
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Experience Lossless Streaming with <span className="text-brandNeon">Premium</span>
        </h1>
        <p className="text-sm text-brandMuted">
          Upgrade to unlock offline capabilities, full quality 320kbps streams, and ad-free listening across all devices.
        </p>
      </header>

      {/* Success notification banner */}
      {successMsg && (
        <div className="max-w-md mx-auto p-4 bg-brandNeon/10 border border-brandNeon/30 rounded-xl text-center text-xs font-bold text-brandNeon">
          {successMsg}
        </div>
      )}

      {/* Plans Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === 'free';
          return (
            <div
              key={plan.id}
              className={`bg-brandDarkGray border rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative transition-all duration-300 hover:scale-[1.01] ${
                plan.id === 'individual' ? 'border-brandNeon/60 ring-1 ring-brandNeon/30' : 'border-brandHighlight'
              }`}
            >
              {/* Badge Overlay */}
              <span className={`absolute top-4 right-4 text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                plan.id === 'individual' ? 'bg-brandNeon text-brandBg' : 'bg-brandElevated text-brandMuted'
              }`}>
                {plan.badge}
              </span>

              {/* Top details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-xs text-brandMuted">/ month</span>
                  </div>
                </div>
                <p className="text-xs text-brandMuted leading-relaxed">{plan.description}</p>
                <div className="border-t border-brandElevated my-4" />
                
                {/* Benefits List */}
                <ul className="space-y-2.5">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-brandMuted leading-normal">
                      <Check className="w-4 h-4 text-brandNeon flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call-to-action button */}
              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={isCurrent}
                className={`w-full font-bold py-2.5 rounded-xl text-xs mt-8 transition-all active:scale-[0.98] ${plan.buttonColor}`}
              >
                {isCurrent ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Premium Security info footer */}
      <footer className="max-w-md mx-auto text-center border-t border-brandElevated pt-6 text-[10px] text-brandMuted flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Secure 256-bit SSL encrypted Stripe connection.</span>
      </footer>
    </div>
  );
}
