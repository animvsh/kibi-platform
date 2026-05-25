
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';
import Navigation from './Navigation';

const MainHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center relative z-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="hover-pop">
          <Logo size="md" variant="glow" className="shadow-lg" />
        </Link>
        <Navigation />
      </div>
      
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/courses">
              <Button 
                variant="outline" 
                className="font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all bg-dark-300 border-4 border-dark-200 text-white hover:text-kibi-400"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
            <UserProfileDropdown />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/courses">
              <Button 
                variant="outline" 
                className="font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all bg-dark-300 border-4 border-dark-200 text-white hover:text-kibi-400"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                className="font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all bg-kibi-500 hover:bg-kibi-600 text-white border-4 border-kibi-600"
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
