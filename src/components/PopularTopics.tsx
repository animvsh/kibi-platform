
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PopularTopicsProps {
  topics: { name: string, color: string }[];
  onTopicClick: (topic: string) => void;
}

const PopularTopics: React.FC<PopularTopicsProps> = ({ topics, onTopicClick }) => {
  const isMobile = useIsMobile();

  return (
    <div className="mt-8 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
      <div className="flex flex-wrap gap-3 justify-center">
        {topics.map((topic, index) => (
          <button
            key={topic.name}
            className={`px-3 py-1.5 ${isMobile ? 'text-sm' : 'px-4 py-2'} ${topic.color} text-white font-medium shadow-lg transition-transform duration-200 border-2 sm:border-4 border-dark-300 rounded-xl hover:scale-105 active:scale-95`}
            onClick={() => onTopicClick(topic.name)}
            style={{animationDelay: `${0.6 + (index * 0.1)}s`}}
          >
            {topic.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularTopics;
