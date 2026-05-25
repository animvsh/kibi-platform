
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileX } from 'lucide-react';

interface EmptyCourseStateProps {
  inputText: string | null;
  message?: string;
}

const EmptyCourseState: React.FC<EmptyCourseStateProps> = ({ 
  inputText, 
  message = "No course content provided. Please generate course content first." 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="glass-card p-6 rounded-xl border-4 border-kibi-600 flex flex-col items-center justify-center text-center">
      <FileX className="h-16 w-16 text-red-400 mb-4" />
      <h1 className="text-3xl font-bold mb-6 text-white cartoon-text">Course Content Missing</h1>
      <div className="p-8">
        <p className="text-red-400 mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/outline-builder', { state: { inputText } })}>
            Create New Course
          </Button>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCourseState;
