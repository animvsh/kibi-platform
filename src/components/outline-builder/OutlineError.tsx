
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface OutlineErrorProps {
  error: string;
}

const OutlineError = ({ error }: OutlineErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <p className="text-red-400 mb-4">{error}</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};

export default OutlineError;
