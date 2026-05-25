
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle } from "lucide-react";
import { ArticleSummary } from '@/types/modules/interactive-article';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArticleSummaryViewProps {
  summary: ArticleSummary;
  onComplete: () => void;
  isCompleted: boolean;
}

const ArticleSummaryView: React.FC<ArticleSummaryViewProps> = ({
  summary,
  onComplete,
  isCompleted
}) => {
  if (isCompleted) {
    return (
      <Card className="border-2 border-green-600/30 bg-dark-400">
        <CardHeader className="bg-dark-300 border-b border-dark-200">
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-500" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium">You've completed this module</h3>
            <p className="text-gray-400 mt-2">You can revisit it anytime for review</p>
            
            <div className="mt-8 w-full">
              <h4 className="font-medium mb-3 text-left">Key Takeaways:</h4>
              <ul className="list-disc list-inside text-left space-y-2">
                {summary.key_takeaways.map((point, idx) => (
                  <li key={idx} className="text-gray-300">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center mb-4">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        Module Summary
      </h2>
      
      <div className="space-y-6">
        <Card className="bg-dark-300 border-dark-200 p-4">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <BookOpen className="w-5 h-5 mr-2 text-kibi-400" />
            Key Takeaways
          </h3>
          
          <ul className="list-disc list-inside space-y-2">
            {summary.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="text-gray-300">{takeaway}</li>
            ))}
          </ul>
        </Card>
        
        <Button 
          onClick={onComplete}
          className="ml-auto bg-kibi-500 hover:bg-kibi-600"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Module
        </Button>
      </div>
    </div>
  );
};

export default ArticleSummaryView;
