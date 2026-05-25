
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/animated-background';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthForm from '@/components/auth/AuthForm';
import AuthBenefits from '@/components/auth/AuthBenefits';
import AuthFooter from '@/components/auth/AuthFooter';

export default function Auth() {
  const { user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark overflow-hidden">
      <AnimatedBackground variant="circles" intensity="high" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthHeader />
        
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-4">
          <AuthBenefits />
          <AuthForm />
        </div>
        
        <AuthFooter />
      </div>
    </div>
  );
}
