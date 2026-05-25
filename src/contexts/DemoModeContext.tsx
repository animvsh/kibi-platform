
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DemoModeContextProps {
  isDemoMode: boolean;
  setIsDemoMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  toggleDemoMode: (enabled: boolean) => Promise<void>;
  isDSADemoMode: boolean;
  setIsDSADemoMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDSADemoMode: (enabled: boolean) => Promise<void>;
  canUseDSADemo: boolean;
}

const DemoModeContext = createContext<DemoModeContextProps | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isDSADemoMode, setIsDSADemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if current user can use DSA demo mode
  const canUseDSADemo = user?.email === "animeshalang18@gmail.com";

  useEffect(() => {
    const fetchDemoModePreference = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data: preferences, error: preferencesError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (preferencesError) {
            console.error("Error fetching user preferences:", preferencesError);
            setIsLoading(false);
            return;
          }

          if (!preferences) {
            const insertData: any = {
              id: user.id,
              demo_mode_enabled: false,
              email_notifications_enabled: true
            };

            const { error: insertError } = await supabase
              .from('user_preferences')
              .insert(insertData);
              
            if (insertError) {
              console.error("Error creating user preferences:", insertError);
            }
            setIsDemoMode(false);
            setIsDSADemoMode(false);
          } else {
            const demoModeEnabled = (preferences as any).demo_mode_enabled;
            setIsDemoMode(demoModeEnabled === true);
            // For DSA demo mode, we'll store it in localStorage since the column doesn't exist
            const dsaDemoModeEnabled = localStorage.getItem(`dsa_demo_mode_${user.id}`) === 'true';
            setIsDSADemoMode(dsaDemoModeEnabled && canUseDSADemo);
          }
        } catch (error) {
          console.error("Failed to fetch demo mode setting:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsDemoMode(false);
        setIsDSADemoMode(false);
        setIsLoading(false);
      }
    };

    fetchDemoModePreference();
  }, [user, canUseDSADemo]);

  const toggleDemoMode = async (enabled: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updateData: any = { 
        demo_mode_enabled: enabled 
      };

      const { error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error("Failed to update demo mode:", error);
        toast.error("Failed to update demo mode setting");
        return;
      }
      
      setIsDemoMode(enabled);
      toast.success(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling demo mode:", error);
      toast.error("An error occurred while updating settings");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDSADemoMode = async (enabled: boolean) => {
    if (!user || !canUseDSADemo) return;
    
    setIsLoading(true);
    try {
      // Store DSA demo mode in localStorage since the column doesn't exist in the database
      localStorage.setItem(`dsa_demo_mode_${user.id}`, enabled.toString());
      
      setIsDSADemoMode(enabled);
      toast.success(`DSA Demo mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling DSA demo mode:", error);
      toast.error("An error occurred while updating settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DemoModeContext.Provider value={{ 
      isDemoMode, 
      setIsDemoMode, 
      isLoading, 
      toggleDemoMode,
      isDSADemoMode,
      setIsDSADemoMode,
      toggleDSADemoMode,
      canUseDSADemo
    }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
