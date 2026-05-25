
import React from 'react';
import PopularCourses from '@/components/PopularCourses';
import FeatureGrid from '@/components/FeatureGrid';
import TestimonialGrid from '@/components/TestimonialGrid';
import CallToAction from '@/components/CallToAction';
import PricingSection from '@/components/PricingSection';

interface ContentSectionProps {
  features: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    avatar: string;
    bgColor: string;
    borderColor: string;
  }>;
}

const ContentSection: React.FC<ContentSectionProps> = ({ features, testimonials }) => {
  return (
    <>
      <div className="w-full max-w-5xl mb-16">
        <PopularCourses />
      </div>

      <FeatureGrid features={features} />

      <TestimonialGrid testimonials={testimonials} />
      
      <PricingSection />

      <CallToAction />

      <div className="w-full max-w-5xl mt-12 flex justify-center">
        <div className="grid grid-cols-3 gap-6 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          {[1, 2, 3].map((index) => (
            <div key={index} className={`h-2 w-16 ${
              index === 1 ? 'bg-kibi-400' : index === 2 ? 'bg-kibi-500' : 'bg-kibi-600'
            }`}></div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ContentSection;
