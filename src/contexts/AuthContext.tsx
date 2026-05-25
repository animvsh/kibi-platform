
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, UserProfile, UserSubscription } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading: authLoading } = useAuthState();
  const { 
    loading: actionsLoading, 
    signUp, 
    signIn, 
    signOut, 
    resetPassword, 
    updatePassword 
  } = useAuthActions();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile, subscription and referral when user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setProfile(null);
        setSubscription(null);
        setReferralCode(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        setProfile(profileData as UserProfile);

        // Fetch user subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_plans(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!subscriptionError) {
          setSubscription({
            ...subscriptionData,
            plan_name: subscriptionData.subscription_plans?.name
          });
        }

        // Fetch referral code
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('referrer_id', user.id)
          .limit(1)
          .single();
        
        if (!referralError) {
          setReferralCode(referralData.referral_code);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Combine loading states
  const isLoading = loading || authLoading || actionsLoading;

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading: isLoading, 
      signUp, 
      signIn, 
      signOut, 
      resetPassword, 
      updatePassword,
      profile,
      subscription,
      referralCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
