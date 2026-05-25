
// Premium user utilities

import { supabase } from "@/integrations/supabase/client";

/**
 * Check if current user is a premium user
 * Premium users have additional capabilities like creating private courses
 */
export const isPremiumUser = async (): Promise<boolean> => {
  try {
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is logged in, they're not premium
    if (!user) return false;
    
    // Special case: this specific email is always premium
    if (user.email === "animeshalang18@gmail.com") {
      return true;
    }
    
    // Check if user has a premium subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    // Premium users have plan_id > 1 (free tier is 1) and status is active
    return subscription && subscription.plan_id > 1 && subscription.status === 'active';
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

/**
 * Verifies if a user can perform a premium feature action
 * @param featureName Name of the premium feature
 * @returns true if feature is allowed, false otherwise
 */
export const canUsePremiumFeature = async (featureName: string): Promise<boolean> => {
  // For now we just check if user is premium
  return await isPremiumUser();
};

/**
 * Get premium feature error message
 * @param featureName Name of the premium feature
 * @returns Error message for the feature
 */
export const getPremiumFeatureError = (featureName: string): string => {
  return `"${featureName}" is a premium feature. Please upgrade your account to access it.`;
};
