
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActiveCoursePromptDialogProps {
  open: boolean;
  courseName?: string;
  onContinueBrowsing: () => void;
  onViewProgress: () => void;
  onOpenChange: (open: boolean) => void;
}

const ActiveCoursePromptDialog: React.FC<ActiveCoursePromptDialogProps> = ({
  open,
  courseName,
  onContinueBrowsing,
  onViewProgress,
  onOpenChange,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Course Generation In Progress</AlertDialogTitle>
          <AlertDialogDescription>
            Your course
            {courseName ? ` "${courseName}"` : ""}
            {" is currently being generated. Would you like to go back to the generation page to monitor progress?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onContinueBrowsing}>
            Continue browsing
          </AlertDialogCancel>
          <AlertDialogAction onClick={onViewProgress}>
            View Generation Progress
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
};

export default ActiveCoursePromptDialog;
