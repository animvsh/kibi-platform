
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackToHome from '@/components/BackToHome';
import AnimatedBackground from '@/components/animated-background';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-500 relative overflow-hidden">
      <AnimatedBackground variant="shapes" intensity="low" />
      
      <div className="text-center p-8 rounded-xl bg-dark-400/80 backdrop-blur-md border-4 border-dark-300/50 shadow-[0_8px_0_rgba(0,0,0,0.3)] z-10">
        <h1 className="text-6xl font-bold mb-4 text-kibi-400">404</h1>
        <p className="text-2xl text-white mb-6">Oops! Page not found</p>
        <BackToHome className="flex justify-center mt-6" />
      </div>
    </div>
  );
};

export default NotFound;
