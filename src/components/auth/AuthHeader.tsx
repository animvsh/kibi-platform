
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import BackToHome from '@/components/BackToHome';

const AuthHeader: React.FC = () => {
  return (
    <header className="w-full py-6 px-6 flex justify-between items-center relative z-10">
      <Link to="/" className="flex items-center gap-3 hover-pop">
        <Logo size="md" className="shadow-lg" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider cartoon-text">
            <span className="text-kibi-400">k</span>
            <span className="text-kibi-300">i</span>
            <span className="text-kibi-400">b</span>
            <span className="text-kibi-300">i</span>
          </h1>
          <p className="text-sm text-gray-400">Learn anything, your way</p>
        </div>
      </Link>
      
      <BackToHome />
    </header>
  );
};

export default AuthHeader;
