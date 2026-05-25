
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, KeyRound, Loader2, CheckCircle } from 'lucide-react';

// Unified schema for auth forms
const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").or(z.string().optional()).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormValues = z.infer<typeof authSchema>;
type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'resetSent';

interface AuthFormProps {
  initialMode?: AuthMode;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { signIn, signUp } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: 'onChange'
  });

  const onSubmit = async (values: AuthFormValues) => {
    try {
      setAuthLoading(true);
      setSuccessMessage('');
      
      if (mode === 'login') {
        if (values.password) {
          await signIn(values.email, values.password);
          console.log("Login attempted with:", values.email);
        }
      } else if (mode === 'signup') {
        if (values.password) {
          await signUp(values.email, values.password, values.email.split('@')[0]);
          console.log("Signup attempted with:", values.email);
        }
      } else if (mode === 'forgotPassword') {
        // Handle password reset
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: window.location.origin + '/auth?reset=true',
        });
        
        if (error) throw error;
        
        setMode('resetSent');
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setAuthLoading(true);
      setSuccessMessage('');
      const email = form.getValues('email');
      
      if (!email) {
        form.setError('email', { 
          type: 'manual', 
          message: 'Please enter your email to resend confirmation'
        });
        return;
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      setSuccessMessage('Confirmation email sent! Please check your inbox.');
    } catch (error: any) {
      form.setError('email', { 
        type: 'manual', 
        message: error.message || 'Failed to send confirmation email'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kibi-500 to-kibi-700 flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_rgba(0,0,0,0.3)]">
          {mode === 'forgotPassword' ? (
            <KeyRound size={24} className="text-white" />
          ) : mode === 'resetSent' ? (
            <CheckCircle size={24} className="text-white" />
          ) : (
            <div className="text-white text-2xl font-bold">K</div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 cartoon-text">
          {mode === 'login' ? 'Welcome back!' : 
          mode === 'signup' ? 'Join Kibi' : 
          mode === 'forgotPassword' ? 'Reset Password' :
          'Check Your Email'}
        </h2>
        <p className="text-gray-300">
          {mode === 'login' 
            ? 'Log in to continue your learning journey' 
            : mode === 'signup'
            ? 'Create an account to start learning'
            : mode === 'forgotPassword'
            ? 'Enter your email to receive a password reset link'
            : 'We\'ve sent you a password reset link'
          }
        </p>
      </div>
    );
  };

  const renderResetSent = () => {
    return (
      <div className="text-center mt-6">
        <div className="p-6 bg-dark-300 rounded-xl border-4 border-kibi-600/30 mb-6">
          <p className="text-white mb-6">
            We've sent a password reset link to your email. Please check your inbox.
          </p>
          <div className="w-20 h-20 mx-auto bg-kibi-600/20 rounded-full flex items-center justify-center animate-pulse">
            <Mail size={32} className="text-kibi-400" />
          </div>
        </div>
        
        <Button
          onClick={() => setMode('login')}
          className="w-full mt-4 btn-3d font-bold bg-gradient-to-r from-kibi-500 to-kibi-600 hover:from-kibi-600 hover:to-kibi-700 border-2 border-kibi-600"
        >
          Back to Login
        </Button>
      </div>
    );
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <Mail size={14} className="text-kibi-400" /> Email
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@example.com" 
                  className="bg-dark-300 text-white border-dark-200 focus:border-kibi-500 blocky-input" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {mode !== 'forgotPassword' && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white flex items-center gap-2">
                  <Lock size={14} className="text-kibi-400" /> Password
                </FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-dark-300 text-white border-dark-200 focus:border-kibi-500 blocky-input" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {mode === 'signup' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white flex items-center gap-2">
                  <Lock size={14} className="text-kibi-400" /> Confirm Password
                </FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-dark-300 text-white border-dark-200 focus:border-kibi-500 blocky-input" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full mt-6 btn-3d font-bold bg-gradient-to-r from-kibi-500 to-kibi-600 hover:from-kibi-600 hover:to-kibi-700 border-2 border-kibi-600 flex items-center justify-center gap-2"
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === 'login' ? "Signing in..." : 
               mode === 'signup' ? "Creating Account..." :
               "Sending Reset Link..."}
            </>
          ) : (
            <>
              {mode === 'login' ? "Sign In" : 
               mode === 'signup' ? "Create Account" :
               "Reset Password"} <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
  
  const renderFormFooter = () => {
    if (mode === 'login') {
      return (
        <>
          <Button 
            variant="link" 
            onClick={() => {
              setMode('forgotPassword');
              form.reset({ email: form.getValues('email'), password: '', confirmPassword: '' });
            }}
            className="text-kibi-400 p-0 hover:text-kibi-300 hover:scale-110 block mx-auto mb-3"
          >
            Forgot Password?
          </Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dark-400 px-2 text-gray-400">or</span>
            </div>
          </div>
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              onClick={() => {
                setMode('signup');
                form.reset();
              }}
              className="text-kibi-400 p-0 hover:text-kibi-300 hover:scale-110"
            >
              Sign Up
            </Button>
          </p>
        </>
      );
    } else if (mode === 'signup') {
      return (
        <>
          <Button 
            variant="link" 
            onClick={handleResendConfirmation}
            disabled={authLoading}
            className="text-kibi-400 p-0 hover:text-kibi-300 hover:scale-110 block mx-auto mb-3 flex items-center gap-1 justify-center"
          >
            {authLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Resend Confirmation Email
          </Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dark-400 px-2 text-gray-400">or</span>
            </div>
          </div>
          <p className="text-gray-400">
            Already have an account?{" "}
            <Button 
              variant="link" 
              onClick={() => {
                setMode('login');
                form.reset();
              }}
              className="text-kibi-400 p-0 hover:text-kibi-300 hover:scale-110"
            >
              Log In
            </Button>
          </p>
        </>
      );
    } else if (mode === 'forgotPassword') {
      return (
        <p className="text-gray-400">
          Remember your password?{" "}
          <Button 
            variant="link" 
            onClick={() => {
              setMode('login');
              form.reset({ email: form.getValues('email'), password: '', confirmPassword: '' });
            }}
            className="text-kibi-400 p-0 hover:text-kibi-300 hover:scale-110"
          >
            Back to Login
          </Button>
        </p>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-md glass-card p-8 transform hover:-translate-y-2 hover:border-kibi-500 transition-all duration-500 bg-dark-400/70 backdrop-blur-md">
      {renderHeader()}
      
      {successMessage && (
        <div className="bg-kibi-600/20 border-2 border-kibi-500 rounded-lg p-3 mb-4 text-center animate-pulse">
          <p className="text-kibi-300 flex items-center justify-center gap-2">
            <CheckCircle size={16} /> {successMessage}
          </p>
        </div>
      )}
      
      {mode !== 'resetSent' ? (
        <>
          {renderFormContent()}
          <div className="mt-6 text-center">
            {renderFormFooter()}
          </div>
        </>
      ) : (
        renderResetSent()
      )}
    </div>
  );
};

export default AuthForm;
