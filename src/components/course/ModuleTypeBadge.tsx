
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Book, Video, Code, PenTool, BookOpen, FlipHorizontal, CheckSquare, BookOpenCheck } from "lucide-react";

export const getModuleIcon = (type: string) => {
  switch (type) {
    case 'article':
      return <Book className="h-4 w-4 text-blue-300" />;
    case 'article_interactive':
      return <BookOpenCheck className="h-4 w-4 text-cyan-300" />;
    case 'lecture':
      return <Video className="h-4 w-4 text-purple-300" />;
    case 'lecture_interactive':
      return <Video className="h-4 w-4 text-fuchsia-300" />;
    case 'code':
      return <Code className="h-4 w-4 text-green-300" />;
    case 'simulation':
      return <PenTool className="h-4 w-4 text-amber-300" />;
    case 'quiz':
      return <CheckSquare className="h-4 w-4 text-pink-300" />;
    case 'flashcard':
      return <FlipHorizontal className="h-4 w-4 text-orange-300" />;
    case 'review':
      return <BookOpen className="h-4 w-4 text-teal-300" />;
    default:
      return <Book className="h-4 w-4 text-gray-300" />;
  }
};

export const getModuleTypeLabel = (type: string) => {
  switch (type) {
    case 'article':
      return <Badge variant="outline" className="bg-blue-900/30 text-blue-300">Article</Badge>;
    case 'article_interactive':
      return <Badge variant="outline" className="bg-cyan-900/30 text-cyan-300">Interactive Article</Badge>;
    case 'lecture':
      return <Badge variant="outline" className="bg-purple-900/30 text-purple-300">Lecture</Badge>;
    case 'lecture_interactive':
      return <Badge variant="outline" className="bg-fuchsia-900/30 text-fuchsia-300">Interactive Lecture</Badge>;
    case 'code':
      return <Badge variant="outline" className="bg-green-900/30 text-green-300">Code Task</Badge>;
    case 'simulation':
      return <Badge variant="outline" className="bg-amber-900/30 text-amber-300">Simulation</Badge>;
    case 'quiz':
      return <Badge variant="outline" className="bg-pink-900/30 text-pink-300">Quiz</Badge>;
    case 'flashcard':
      return <Badge variant="outline" className="bg-orange-900/30 text-orange-300">Flashcards</Badge>;
    case 'review':
      return <Badge variant="outline" className="bg-teal-900/30 text-teal-300">Review</Badge>;
    default:
      return <Badge variant="outline">Module</Badge>;
  }
};
