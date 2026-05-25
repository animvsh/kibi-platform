
import React from 'react';
import { ArticleSummary } from '@/types/modules/interactive-article';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, BookOpen, Pencil } from 'lucide-react';

interface SummaryRendererProps {
  summary: ArticleSummary;
}

const SummaryRenderer: React.FC<SummaryRendererProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center mb-4">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          Module Summary
        </h2>
        <p className="text-gray-300 mb-4">
          Congratulations on completing all the sections! Here's a summary of what you've learned.
        </p>
      </div>
      
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
      
      <Card className="bg-dark-300 border-dark-200 p-4">
        <h3 className="text-lg font-medium flex items-center mb-4">
          <Pencil className="w-5 h-5 mr-2 text-kibi-400" />
          Review Task
        </h3>
        
        <div className="bg-dark-400 p-4 rounded-md border border-dark-200">
          <p className="text-gray-300">{summary.review_task}</p>
        </div>
      </Card>
    </div>
  );
};

export default SummaryRenderer;
