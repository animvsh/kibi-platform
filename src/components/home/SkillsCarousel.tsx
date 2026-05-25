
import React, { useEffect, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem 
} from "@/components/ui/carousel";
import { Book, Code, Database, Zap, Globe, PenTool, Briefcase, Brain, Cloud } from 'lucide-react';

const POPULAR_SKILLS = [
  { name: "React", color: "text-cyan-400", icon: Code },
  { name: "JavaScript", color: "text-yellow-400", icon: Code },
  { name: "Python", color: "text-blue-400", icon: Database },
  { name: "Machine Learning", color: "text-green-400", icon: Brain },
  { name: "Web Development", color: "text-pink-400", icon: Globe },
  { name: "Data Science", color: "text-purple-400", icon: Database },
  { name: "UI/UX Design", color: "text-orange-400", icon: PenTool },
  { name: "Node.js", color: "text-emerald-400", icon: Code },
  { name: "TypeScript", color: "text-sky-400", icon: Code },
  { name: "Blockchain", color: "text-amber-400", icon: Zap },
  { name: "React Native", color: "text-indigo-400", icon: Globe },
  { name: "Docker", color: "text-blue-500", icon: Briefcase },
  { name: "AWS", color: "text-yellow-600", icon: Cloud },
  { name: "GraphQL", color: "text-pink-500", icon: Briefcase },
  { name: "Go", color: "text-cyan-500", icon: Code },
  { name: "Swift", color: "text-red-500", icon: Book }
];

const SkillsCarousel = () => {
  const apiRef = useRef<any>(null);
  
  useEffect(() => {
    // Set up continuous auto-scrolling
    const autoScrollInterval = setInterval(() => {
      if (apiRef.current && typeof apiRef.current.scrollNext === 'function') {
        apiRef.current.scrollNext();
      }
    }, 2000); // Scroll every 2 seconds
    
    return () => clearInterval(autoScrollInterval);
  }, []);
  
  return (
    <div className="w-full my-4">
      <h2 className="text-xl font-bold mb-4 text-center text-white cartoon-text">Popular Skills</h2>
      <Carousel 
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={(api) => (apiRef.current = api)}
        className="w-full"
      >
        <CarouselContent className="py-4">
          {POPULAR_SKILLS.map((skill, index) => {
            const SkillIcon = skill.icon;
            return (
              <CarouselItem key={index} className="pl-4 md:basis-1/4 lg:basis-1/6">
                <div className={`bg-dark-300 border-2 border-dark-200 rounded-xl px-4 py-3 text-center transition-transform hover:scale-110 hover:-rotate-2 flex flex-col items-center justify-center ${skill.color}`}>
                  <SkillIcon className="mb-2 w-6 h-6" />
                  <span className="text-sm font-medium">{skill.name}</span>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default SkillsCarousel;

