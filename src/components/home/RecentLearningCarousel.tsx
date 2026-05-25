
import React, { useEffect, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem 
} from "@/components/ui/carousel";
import { Book, Code, Database, Zap, Globe, PenTool, Briefcase, Brain, Cloud, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const RECENT_LEARNINGS = [
  { name: "React Hooks", color: "text-cyan-400", icon: Code },
  { name: "JavaScript Promises", color: "text-yellow-400", icon: Code },
  { name: "Python Data Analysis", color: "text-blue-400", icon: Database },
  { name: "Neural Networks", color: "text-green-400", icon: Brain },
  { name: "Responsive Design", color: "text-pink-400", icon: Globe },
  { name: "SQL Fundamentals", color: "text-purple-400", icon: Database },
  { name: "UX Research", color: "text-orange-400", icon: PenTool },
  { name: "Node.js API", color: "text-emerald-400", icon: Code },
  { name: "TypeScript Generics", color: "text-sky-400", icon: Code },
  { name: "Web3 Development", color: "text-amber-400", icon: Zap },
  { name: "Mobile App Design", color: "text-indigo-400", icon: Globe },
  { name: "Docker Containers", color: "text-blue-500", icon: Briefcase },
  { name: "Cloud Architecture", color: "text-yellow-600", icon: Cloud },
  { name: "GraphQL Queries", color: "text-pink-500", icon: Briefcase },
  { name: "Go Concurrency", color: "text-cyan-500", icon: Code },
  { name: "Swift UI", color: "text-red-500", icon: Book }
];

interface RecentLearningCarouselProps {
  onItemClick?: (topic: string) => void;
}

const RecentLearningCarousel: React.FC<RecentLearningCarouselProps> = ({ onItemClick }) => {
  const apiRef = useRef<any>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Set up continuous auto-scrolling
    const autoScrollInterval = setInterval(() => {
      if (apiRef.current && typeof apiRef.current.scrollNext === 'function') {
        apiRef.current.scrollNext();
      }
    }, 3000); // Scroll every 3 seconds
    
    return () => clearInterval(autoScrollInterval);
  }, []);
  
  return (
    <div className="w-full">
      <h2 className="flex items-center justify-center gap-2 text-lg font-medium mb-4 text-white">
        <span>Things people have learned recently</span>
        <ChevronRight size={18} className="text-kibi-400" />
      </h2>
      <Carousel 
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={(api) => (apiRef.current = api)}
        className="w-full"
      >
        <CarouselContent className="py-2">
          {RECENT_LEARNINGS.map((learning, index) => {
            const LearningIcon = learning.icon;
            return (
              <CarouselItem 
                key={index} 
                className={`pl-4 ${isMobile ? 'basis-1/2' : 'md:basis-1/3 lg:basis-1/5'}`}
              >
                <div 
                  className={`bg-dark-300/70 backdrop-blur-sm border border-dark-200 rounded-xl px-3 py-2 text-center transition-all hover:scale-105 hover:-rotate-1 flex flex-col items-center justify-center ${learning.color} cursor-pointer`}
                  onClick={() => onItemClick && onItemClick(learning.name)}
                >
                  <LearningIcon className="mb-1 w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{learning.name}</span>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default RecentLearningCarousel;
