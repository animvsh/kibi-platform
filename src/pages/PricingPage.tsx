
import React from 'react';
import HomeLayout from '@/components/home/HomeLayout';
import PricingSection from '@/components/PricingSection';

const PricingPage = () => {
  return (
    <HomeLayout>
      <div className="w-full max-w-5xl mx-auto py-12 px-4">
        <h1 id="pricing" className="text-4xl md:text-5xl font-bold text-white text-center mb-12 cartoon-text">
          <span className="text-kibi-400">p</span>
          <span className="text-kibi-300">r</span>
          <span className="text-kibi-400">i</span>
          <span className="text-kibi-300">c</span>
          <span className="text-kibi-400">i</span>
          <span className="text-kibi-300">n</span>
          <span className="text-kibi-400">g</span>
        </h1>
        <PricingSection />
      </div>
    </HomeLayout>
  );
};

export default PricingPage;
