
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface PreferencesFormValues {
  demoModeEnabled: boolean;
  dsaDemoModeEnabled: boolean;
  darkModeEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

const PreferencesTab = () => {
  const { user } = useAuth();
  const { isDemoMode, toggleDemoMode, isDSADemoMode, toggleDSADemoMode, canUseDSADemo } = useDemoMode();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesFormValues>({
    demoModeEnabled: isDemoMode,
    dsaDemoModeEnabled: isDSADemoMode,
    darkModeEnabled: true,
    emailNotificationsEnabled: true,
  });

  const form = useForm<PreferencesFormValues>({
    defaultValues: preferences
  });

  // Load user preferences when component mounts
  React.useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const updatedPrefs = {
          demoModeEnabled: (data as any).demo_mode_enabled || false,
          dsaDemoModeEnabled: (data as any).dsa_demo_mode_enabled || false,
          darkModeEnabled: (data as any).dark_mode_enabled !== false, // Default to true
          emailNotificationsEnabled: (data as any).email_notifications_enabled !== false, // Default to true
        };
        
        setPreferences(updatedPrefs);
        form.reset(updatedPrefs);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: PreferencesFormValues) => {
    setIsLoading(true);
    try {
      // Handle demo mode toggle through context to ensure app-wide state update
      if (values.demoModeEnabled !== isDemoMode) {
        await toggleDemoMode(values.demoModeEnabled);
      }
      
      // Handle DSA demo mode toggle through context
      if (values.dsaDemoModeEnabled !== isDSADemoMode && canUseDSADemo) {
        await toggleDSADemoMode(values.dsaDemoModeEnabled);
      }
      
      // Update other preferences directly
      const updateData: any = {
        dark_mode_enabled: values.darkModeEnabled,
        email_notifications_enabled: values.emailNotificationsEnabled,
      };

      const { error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Preferences updated!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Preferences</h3>
        <p className="text-gray-400">Customize your experience with KibiLearn</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="demoModeEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Demo Mode</FormLabel>
                  <FormDescription className="text-sm text-gray-400">
                    When enabled, courses will only generate articles, videos, quizzes, and reviews.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {canUseDSADemo && (
            <FormField
              control={form.control}
              name="dsaDemoModeEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-kibi-900/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">DSA Demo Mode</FormLabel>
                    <FormDescription className="text-sm text-gray-400">
                      Shows hardcoded Data Structures and Algorithms course content regardless of input. This overrides regular demo mode.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="darkModeEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Dark Mode</FormLabel>
                  <FormDescription className="text-sm text-gray-400">
                    Enable dark mode for the application interface.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailNotificationsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Notifications</FormLabel>
                  <FormDescription className="text-sm text-gray-400">
                    Receive email notifications about course updates and new features.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="w-full bg-kibi-500 text-white px-4 py-2 rounded-md hover:bg-kibi-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </Form>
    </div>
  );
};

export default PreferencesTab;
