
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

type HeaderProps = {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-6">
      <Link to="/" className="flex items-center gap-3">
        <Logo size="md" variant="default" className="shadow-lg" />
        <h1 className="text-2xl font-bold text-white tracking-wider cartoon-text">
          Learn
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="bg-dark-400 border-4 border-dark-300 text-gray-400 hover:bg-dark-300 hover:text-white btn-3d font-bold rounded-xl"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Tutorials
        </Button>
        
        <Button 
          className="bg-kibi-500 hover:bg-kibi-600 text-white border-4 border-kibi-600 font-bold btn-3d rounded-xl"
        >
          + Create Course
        </Button>
      </div>
    </div>
  );
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
