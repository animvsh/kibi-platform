
import React from 'react';
import QuizModuleComponent from './QuizModuleComponent';
import type { QuizModule } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';

const TestQuizModule: React.FC = () => {
  const sampleQuizModule: QuizModule = {
    id: uuidv4(),
    title: "React Fundamentals Quiz",
    questions: [
      {
        id: uuidv4(),
        type: 'multiple_choice',
        question_text: "What hook is used for managing state in React?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correct_option: "useState"
      },
      {
        id: uuidv4(),
        type: 'true_false',
        question_text: "React components must always return a single root element.",
        answer: true
      },
      {
        id: uuidv4(),
        type: 'fill_blank',
        question_text: "To render a list in React, you should use the ____ method on your array of data.",
        answer: "map",
        alternatives: ["map()", ".map", "Array.map"]
      },
      {
        id: uuidv4(),
        type: 'match_terms',
        question_text: "Match each React concept to its definition.",
        pairs: {
          "useState": "Hook for adding state to functional components",
          "useEffect": "Hook for handling side effects",
          "Props": "Data passed from parent to child components"
        }
      },
      {
        id: uuidv4(),
        type: 'reflection',
        question_text: "Why is it important to use keys when rendering lists in React?",
        expected_elements: [
          "Helps React identify which items have changed",
          "Improves performance",
          "Prevents rendering bugs"
        ]
      }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Module Test</h1>
      <QuizModuleComponent 
        module={sampleQuizModule}
        onComplete={(score) => console.log(`Quiz completed with score: ${score}`)}
      />
    </div>
  );
};

export default TestQuizModule;
