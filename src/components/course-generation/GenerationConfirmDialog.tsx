
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
import { GenerateOutlineResponse } from "@/types/course";

interface GenerationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopCourseGeneration: (opts: { hardClear?: boolean }) => void;
  startCourseGeneration: (args: any) => void;
  setPendingOutline: (outline: GenerateOutlineResponse | null) => void;
  setShowConfirmDialog: (open: boolean) => void;
  pendingOutline: GenerateOutlineResponse | null;
}

const GenerationConfirmDialog: React.FC<GenerationConfirmDialogProps> = ({
  open,
  onOpenChange,
  stopCourseGeneration,
  startCourseGeneration,
  setPendingOutline,
  setShowConfirmDialog,
  pendingOutline,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stop Current Generation?</AlertDialogTitle>
          <AlertDialogDescription>
            A course is currently being generated. Starting a new generation will stop the current one. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingOutline(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              stopCourseGeneration({ hardClear: true });
              if (pendingOutline) {
                startCourseGeneration({
                  courseId: null,
                  courseName: pendingOutline.title,
                  totalUnits: pendingOutline.units.length,
                  currentUnit: 0,
                  progress: 0,
                  outlineId: pendingOutline.id !== undefined ? String(pendingOutline.id) : undefined,
                });
                setPendingOutline(null);
              }
              setShowConfirmDialog(false);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GenerationConfirmDialog;
