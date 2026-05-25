
import { useState } from 'react';
import { QuizQuestion } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useQuizDialog = (moduleId: string) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<{score: number, total: number} | null>(null);
  const { toast } = useToast();

  const generateQuiz = async (transcript: string, moduleTitle: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { 
          transcript,
          moduleTitle
        }
      });
      
      if (error) throw new Error(error.message);
      
      const questions: QuizQuestion[] = data.quiz.map((q: any) => ({
        question: q.question_text,
        options: q.options,
        correctAnswer: q.options.findIndex(opt => opt === q.correct_option),
        explanation: `The correct answer is: ${q.correct_option}`
      }));
      
      setQuizQuestions(questions);
      setSelectedAnswers(Array(questions.length).fill(-1));
      setShowQuiz(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setErrorMessage("Could not generate quiz. Please try again.");
      toast({
        title: "Error",
        description: "Failed to generate quiz questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizResults({ score, total: quizQuestions.length });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const historyItem = {
          moduleId,
          quizData: {
            questions: quizQuestions,
            userAnswers: selectedAnswers
          },
          correctCount,
          createdAt: new Date().toISOString()
        };
        
        const existingHistory = localStorage.getItem('lecture_quiz_history') || '[]';
        const history = JSON.parse(existingHistory);
        history.push(historyItem);
        localStorage.setItem('lecture_quiz_history', JSON.stringify(history));
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setQuizResults(null);
  };

  return {
    showQuiz,
    setShowQuiz,  // Explicitly returning the setter function
    quizQuestions,
    selectedAnswers,
    loading,
    errorMessage,
    quizResults,
    generateQuiz,
    handleAnswerSelect,
    handleQuizSubmit,
    handleCloseQuiz
  };
};
