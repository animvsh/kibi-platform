
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackToHomeProps {
  className?: string;
}

const BackToHome = ({ className = "" }: BackToHomeProps) => {
  return (
    <div className={`${className}`}>
      <Link to="/">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 hover-bounce"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default BackToHome;
