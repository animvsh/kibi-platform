
import React from 'react';
import { ReviewSummaryModuleProps } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewSummaryModule: React.FC<ReviewSummaryModuleProps> = ({ module, moduleIdx, onComplete, isCompleted }) => {
  return (
    <Card className="bg-dark-400 border-dark-200 mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <span className="bg-kibi-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
            {moduleIdx + 1}
          </span>
          Summary: {module.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-dark-300 rounded-lg p-4">
          <p className="text-white whitespace-pre-line">{module.summary}</p>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-medium text-white mb-3">Key Takeaways</h4>
          <ul className="space-y-2">
            {module.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" />
                <p className="text-white">{takeaway}</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {!isCompleted && (
          <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
            Mark as Complete
          </Button>
        )}
        
        {isCompleted && (
          <div className="flex items-center text-green-500">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Completed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReviewSummaryModule;
