import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { MatchTermsQuestion } from '@/types/quiz';

interface MatchTermsQuestionProps {
  question: MatchTermsQuestion;
  onAnswer: (isCorrect: boolean, userAnswer: Record<string, string | null>) => void;
  showFeedback?: boolean;
}

interface Term {
  id: string;
  text: string;
}

interface Match {
  termId: string;
  defId: string | null;
}

const MatchTermsQuestionComponent: React.FC<MatchTermsQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [definitions, setDefinitions] = useState<Term[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const termEntries = Object.entries(question.pairs);
    const shuffledTerms = [...termEntries].map(([term, _], index) => ({
      id: `term-${index}`,
      text: term
    }));

    const shuffledDefs = [...termEntries]
      .sort(() => Math.random() - 0.5)
      .map(([_, def], index) => ({
        id: `def-${index}`,
        text: def as string
      }));

    setTerms(shuffledTerms);
    setDefinitions(shuffledDefs);
    setMatches(shuffledTerms.map(term => ({ termId: term.id, defId: null })));
  }, [question]);

  const handleSelectTerm = (termId: string) => {
    if (isSubmitted) return;
    setActiveTerm(termId === activeTerm ? null : termId);
  };

  const handleSelectDefinition = (defId: string) => {
    if (isSubmitted || !activeTerm) return;
    setMatches(prev => {
      const newMatches = prev.map(match =>
        match.defId === defId ? { ...match, defId: null } : match
      );
      return newMatches.map(match =>
        match.termId === activeTerm ? { ...match, defId } : match
      );
    });
    setActiveTerm(null);
  };

  const handleSubmit = () => {
    const allMatched = matches.every(match => match.defId !== null);
    if (!allMatched) return;

    const results: Record<string, boolean> = {};
    let correctCount = 0;

    matches.forEach(match => {
      const termIndex = parseInt(match.termId.split('-')[1]);
      const defIndex = match.defId ? parseInt(match.defId.split('-')[1]) : -1;

      if (defIndex === -1) return;

      const term = Object.keys(question.pairs)[termIndex];
      const correctDef = question.pairs[term];
      const selectedDef = definitions[defIndex]?.text || '';

      const isCorrect = correctDef === selectedDef;
      results[match.termId] = isCorrect;

      if (isCorrect) correctCount++;
    });

    setCorrectMatches(results);
    setIsSubmitted(true);
    const userAnswer: Record<string, string | null> = {};
    matches.forEach(m => { userAnswer[m.termId] = m.defId; });
    onAnswer(correctCount === Object.keys(question.pairs).length, userAnswer);
  };

  const isAllMatched = matches.every(match => match.defId !== null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">{question.question_text}</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm text-gray-400">Terms</h4>
          {terms.map(term => {
            const match = matches.find(m => m.termId === term.id);
            const isMatched = match && match.defId !== null;
            const isActive = activeTerm === term.id;
            const isMatchCorrect = isSubmitted && correctMatches[term.id];
            const isMatchIncorrect = isSubmitted && !correctMatches[term.id];

            return (
              <Card
                key={term.id}
                className={`p-3 cursor-pointer border-2 bg-dark-400 ${
                  isActive ? 'border-kibi-500' :
                  isMatched ? (
                    isMatchCorrect ? 'border-green-500 bg-green-900/20' :
                    isMatchIncorrect ? 'border-red-500 bg-red-900/20' :
                    'border-dark-300'
                  ) : 'border-dark-300'
                }`}
                onClick={() => handleSelectTerm(term.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{term.text}</span>
                  {isMatchCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {isMatchIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </Card>
            );
          })}
        </div>
        <div className="space-y-2">
          <h4 className="text-sm text-gray-400">Definitions</h4>
          {definitions.map(def => {
            const isMatched = matches.some(m => m.defId === def.id);
            const matchedTerm = matches.find(m => m.defId === def.id);
            const termText = matchedTerm
              ? terms.find(t => t.id === matchedTerm.termId)?.text
              : null;

            return (
              <Card
                key={def.id}
                className={`p-3 cursor-pointer border-2 bg-dark-400 ${
                  activeTerm && !isMatched ? 'border-kibi-300' : 'border-dark-300'
                }`}
                onClick={() => handleSelectDefinition(def.id)}
              >
                {isMatched && !isSubmitted && termText && (
                  <div className="flex items-center text-kibi-300 mb-1 text-sm">
                    <span>{termText}</span>
                    <ArrowRight className="h-3 w-3 mx-1" />
                  </div>
                )}
                <span>{def.text}</span>
              </Card>
            );
          })}
        </div>
      </div>
      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={!isAllMatched}
          className="bg-kibi-500 hover:bg-kibi-600 mt-4"
        >
          Check Answers
        </Button>
      )}
      {isSubmitted && showFeedback && (
        <Alert className="bg-dark-400 border-kibi-500/50">
          <AlertDescription>
            <div className="space-y-2">
              <h4 className="font-medium">Correct Pairs:</h4>
              {Object.entries(question.pairs).map(([term, def], idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-medium">{term}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>{def}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MatchTermsQuestionComponent;
