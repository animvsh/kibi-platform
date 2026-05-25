
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  bgColor: string;
  borderColor: string;
}

interface TestimonialGridProps {
  testimonials: Testimonial[];
}

const TestimonialGrid: React.FC<TestimonialGridProps> = ({ testimonials }) => {
  return (
    <div className="w-full max-w-5xl mb-20">
      <h2 className="text-3xl font-bold text-center mb-12 cartoon-text text-white">What Our Users Say</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="glass-card border-4 border-dark-200 p-6 rounded-xl blocky"
          >
            <div className="flex items-center mb-4">
              <Avatar className={`w-12 h-12 border-4 ${testimonial.borderColor} mr-4`}>
                <AvatarFallback className={`${testimonial.bgColor} text-white`}>{testimonial.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-gray-300">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialGrid;
