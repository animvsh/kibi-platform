
import React from 'react';
import AnimatedBackground from '@/components/animated-background';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-dark-500 text-white">
      <AnimatedBackground variant="circles" intensity="low" />
      
      <MainHeader />

      <main className="flex-1 flex flex-col items-center px-4 py-10 relative z-20">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default HomeLayout;
