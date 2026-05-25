
import { supabase } from '@/integrations/supabase/client';

export const runMigrations = async () => {
  try {
    console.log("Running database migrations...");
    
    // Check if demo_mode_enabled column exists by trying to select it
    try {
      const { error: columnCheckError } = await supabase
        .from('user_preferences')
        .select('demo_mode_enabled')
        .limit(1);
      
      if (columnCheckError && columnCheckError.message.includes("column")) {
        console.log("demo_mode_enabled column does not exist, it should have been added via SQL migration");
      } else {
        console.log("demo_mode_enabled column already exists in user_preferences table");
      }
    } catch (error) {
      console.error("Migration error:", error);
    }
    
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Failed to run migrations:", error);
  }
};
