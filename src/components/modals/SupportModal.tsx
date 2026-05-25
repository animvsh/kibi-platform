
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Need Help?</DialogTitle>
        </DialogHeader>
        <div className="h-[600px] relative">
          <iframe
            src="https://tally.so/embed/nG7AjQ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            width="100%"
            height="100%"
            title="Support Form"
            className="border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
