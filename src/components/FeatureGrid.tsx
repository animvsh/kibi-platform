
import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

interface FeatureGridProps {
  features: Feature[];
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  return (
    <div className="w-full max-w-5xl mb-20">
      <h2 className="text-3xl font-bold text-center mb-12 cartoon-text text-white">How Kibi Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`glass-card ${feature.bgColor.replace('/10', '')} border-4 ${feature.borderColor} p-6 rounded-xl text-center blocky`}
          >
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full bg-dark-300 border-4 ${feature.borderColor} flex items-center justify-center icon-3d`}>
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 cartoon-text text-white">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;
