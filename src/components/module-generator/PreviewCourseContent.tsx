
import React from 'react';
import { ExtendedCourseModule } from '@/types/extended-course';

interface PreviewCourseContentProps {
  module: ExtendedCourseModule | undefined;
}

const PreviewCourseContent: React.FC<PreviewCourseContentProps> = ({ module }) => {
  if (!module) {
    return (
      <div className="bg-dark-400 border border-dark-300 rounded-xl px-6 py-16 text-center text-gray-300">
        <p>No module selected or module not found.</p>
      </div>
    );
  }
  return (
    <section className="bg-dark-400 border-4 border-kibi-600 rounded-xl px-8 py-6 shadow-xl animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-3">{module.title}</h1>
      <div className="text-xs text-gray-400 mb-2">{module.type?.replace('_', ' ')}</div>
      {module.description && (
        <div className="mb-2">
          <p className="text-gray-200">{module.description}</p>
        </div>
      )}
      {/* Show stub/partial content */}
      <div className="prose prose-invert max-w-none mt-3">
        {typeof module.content === "string"
          ? <p>{module.content}</p>
          : module.summary
            ? <p>{module.summary}</p>
            : <p>Module preview not available.</p>}
      </div>
      {/* Optionally, show sample for code, video etc. */}
    </section>
  );
};

export default PreviewCourseContent;
