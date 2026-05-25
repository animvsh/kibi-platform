
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Share, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CourseVisibilityControls from './CourseVisibilityControls';
import { cn } from '@/lib/utils';

interface CourseHeaderProps {
  title: string;
  courseId: string;
  shareToken?: string | null;
  isOwner: boolean;
  className?: string;
}

const CourseHeader = ({ title, courseId, shareToken, isOwner, className }: CourseHeaderProps) => {
  const shareCourse = () => {
    if (shareToken) {
      const shareUrl = `${window.location.origin}/course/${courseId}?token=${shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } else {
      toast.error("This course doesn't have a share token.");
    }
  };

  return (
    <header className={cn(
      "flex items-center justify-between p-6",
      className
    )}>
      <h1 className="text-2xl font-bold text-white cartoon-text">{title}</h1>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={shareCourse}
          className="text-gray-300 hover:text-white hover:bg-dark-300"
        >
          <Share className="h-4 w-4 mr-2" /> Share
        </Button>
        
        {isOwner && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="bg-dark-300 border-dark-200 hover:bg-dark-200">
                <Settings className="h-4 w-4 mr-2" /> Course Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-dark-400 border-dark-300">
              <SheetHeader>
                <SheetTitle className="text-white">Course Settings</SheetTitle>
                <SheetDescription>
                  Configure your course visibility and access settings
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <CourseVisibilityControls
                  courseId={courseId}
                  isPublic={true}
                  isPaidOnly={false}
                  shareToken={shareToken}
                  isOwner={isOwner}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};

export default CourseHeader;
