
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileX, Home, Plus, BookOpen } from 'lucide-react';

export const CourseNotFound = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 bg-dark-400 border-2 border-dark-300 rounded-xl">
        <FileX className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
        <p className="text-gray-400 mb-6">The course you're looking for doesn't exist or has been removed, or there was an error loading it.</p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="bg-dark-300 hover:bg-dark-200">
            <Link to="/courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
          
          <Button asChild className="bg-kibi-500 hover:bg-kibi-600">
            <Link to="/outline-builder" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
