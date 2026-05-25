
import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, Shield, Heart, Star } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AuthBenefits = () => {
  const [activeAnimation, setActiveAnimation] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnimation((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const benefits: Benefit[] = [
    { 
      icon: <BookOpen className="text-kibi-300" size={20} />, 
      title: "Personalized Learning", 
      description: "Courses tailored to your unique learning style and pace"
    },
    { 
      icon: <Zap className="text-yellow-400" size={20} />, 
      title: "Learn Faster", 
      description: "AI-powered methods help you retain knowledge 2x faster" 
    },
    { 
      icon: <Shield className="text-kibi-400" size={20} />, 
      title: "Private & Secure", 
      description: "Your learning data is always kept private and secure" 
    },
    { 
      icon: <Heart className="text-red-400" size={20} />, 
      title: "Learn What You Love", 
      description: "Explore any topic you're passionate about" 
    }
  ];

  return (
    <div className="w-full max-w-md mb-8 md:mb-0 md:mr-8 hidden md:block">
      <div className="p-8 mb-6 rounded-3xl bg-dark-400 border-4 border-dark-300 shadow-[0_8px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center mb-6">
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-2xl transition-all duration-500 flex items-start ${activeAnimation === index ? 'bg-kibi-600 border-2 border-kibi-500 scale-105' : 'bg-dark-400 border-2 border-dark-300'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${activeAnimation === index ? 'bg-kibi-700' : 'bg-dark-300'}`}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 p-4 rounded-2xl bg-dark-300 border-2 border-kibi-500">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-yellow-400" size={18} />
            <h3 className="font-bold text-white">Join 10,000+ learners</h3>
          </div>
          <p className="text-sm text-gray-300">Start your learning journey today and connect with other passionate learners from around the world.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthBenefits;
