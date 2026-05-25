
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizModuleComponent from './QuizModuleComponent';

interface RetryQuizBuilderProps {
  show: boolean;
  retryQuizModule: any;
  moduleIdx: number;
  onComplete: () => void;
}

const RetryQuizBuilder: React.FC<RetryQuizBuilderProps> = ({
  show, retryQuizModule, moduleIdx, onComplete
}) => {
  if (!show || !retryQuizModule?.module) return null;
  return (
    <Card className="bg-dark-400 border-dark-200 mb-6 animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <span className="bg-kibi-500 h-8 w-8 rounded-full flex items-center justify-center text-white">{moduleIdx + 1}</span>
          Let's try again — we've built a new quiz just for you!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-white/90 text-base">
          Your new mini-quiz covers the concepts you missed. Give it another shot!
        </div>
        <QuizModuleComponent
          key={retryQuizModule.module.id}
          module={{
            id: retryQuizModule.module.id,
            title: retryQuizModule.module.title,
            questions: retryQuizModule.module.content_json.questions
          }}
          onComplete={onComplete}
        />
      </CardContent>
    </Card>
  );
};

export default RetryQuizBuilder;

