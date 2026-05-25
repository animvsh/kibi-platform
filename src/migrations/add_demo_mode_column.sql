
-- Add demo_mode_enabled column to user_preferences table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences' AND column_name = 'demo_mode_enabled'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN demo_mode_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;
