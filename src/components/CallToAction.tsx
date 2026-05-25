
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mb-20 text-center">
      <div className="border-4 border-kibi-600 p-8 bg-kibi-900 rounded-xl">
        <h2 className="text-3xl font-bold mb-4 cartoon-text text-white">Ready to start learning?</h2>
        <p className="text-xl text-gray-300 mb-6">Join thousands of learners expanding their knowledge with Kibi</p>
        <Link to="/auth">
          <Button 
            className="font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all bg-kibi-500 hover:bg-kibi-600 text-white border-4 border-kibi-600 text-lg px-8 py-6 h-auto rounded-xl"
          >
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;
