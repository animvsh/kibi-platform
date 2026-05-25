
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import HeroInput from '@/components/HeroInput';
import PopularTopics from '@/components/PopularTopics';
import RecentLearningCarousel from './RecentLearningCarousel';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroSectionProps {
  isLoading: boolean;
  error: string;
  onSearch: (text: string) => void;
  onTopicClick: (topic: string) => void;
  popularTopics: Array<{ name: string; color: string }>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  isLoading, 
  error, 
  onSearch, 
  onTopicClick,
  popularTopics 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="max-w-3xl w-full text-center mb-16">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center mb-8 gap-4 animate-fadeInUp`} style={{animationDelay: '0.2s'}}>
        <Logo size={isMobile ? "lg" : "xl"} variant="glow" className="shadow-lg transform hover:scale-105 transition-transform duration-300" />
        <div className="flex flex-col">
          <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold text-white tracking-wider cartoon-text`}>
            <span className="text-kibi-400">k</span>
            <span className="text-kibi-300">i</span>
            <span className="text-kibi-400">b</span>
            <span className="text-kibi-300">i</span>
          </h1>
        </div>
      </div>

      <p className="text-xl text-gray-300 mb-8 flex items-center gap-2 justify-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        learn anything with kibi <Sparkles size={20} className="text-kibi-400 animate-pulse" />
      </p>

      <HeroInput 
        onSearch={onSearch}
        isLoading={isLoading}
        error={error}
      />

      <PopularTopics 
        topics={popularTopics} 
        onTopicClick={onTopicClick}
      />

      <div className="mt-6 animate-fadeInUp" style={{animationDelay: '0.7s'}}>
        <RecentLearningCarousel onItemClick={onTopicClick} />
      </div>
    </div>
  );
};

export default HeroSection;
