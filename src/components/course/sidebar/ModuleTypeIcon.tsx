
import React from 'react';
import { FileText, Video, Code, BookOpen } from 'lucide-react';

interface ModuleTypeIconProps {
  type: string;
}

export const ModuleTypeIcon = ({ type }: ModuleTypeIconProps) => {
  switch (type) {
    case 'article':
    case 'article_interactive':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'lecture':
    case 'lecture_interactive':
      return <Video className="h-4 w-4 text-purple-500" />;
    case 'code':
      return <Code className="h-4 w-4 text-green-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-kibi-500" />;
  }
};
