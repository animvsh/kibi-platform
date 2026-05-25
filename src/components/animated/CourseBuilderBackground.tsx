
import React from 'react';

const CourseBuilderBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-kibi-600/20 blur-3xl animate-pulse" 
        style={{ animation: 'pulse 8s infinite alternate' }}></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-dark-100/10 blur-3xl"
        style={{ animation: 'pulse 12s infinite alternate-reverse' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-kibi-500/10 blur-3xl"
        style={{ animation: 'float 15s infinite ease-in-out' }}></div>
      
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index}
            className="absolute bg-kibi-400 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite alternate ease-in-out`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default CourseBuilderBackground;
