
import React from 'react';
import Logo from '@/components/Logo';

const AuthFooter: React.FC = () => {
  return (
    <footer className="py-6 px-6 text-center text-gray-400 backdrop-blur-md bg-dark-400/30 relative z-10 border-t border-dark-300">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Logo size="sm" className="hover-pop" />
        <p>&copy; {new Date().getFullYear()} Kibi Learning. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AuthFooter;
