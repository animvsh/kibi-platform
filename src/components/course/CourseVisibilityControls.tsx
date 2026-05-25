
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Link, Lock, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isPremiumUser } from "@/utils/premium";

interface CourseVisibilityControlsProps {
  courseId: string;
  isPublic: boolean;
  isPaidOnly: boolean;
  shareToken: string | null;
  isOwner: boolean;
}

const CourseVisibilityControls = ({ courseId, isPublic, isPaidOnly, shareToken, isOwner }: CourseVisibilityControlsProps) => {
  const { user } = useAuth();
  const [userIsPremium, setUserIsPremium] = useState<boolean>(false);
  const [isPublicState, setIsPublicState] = useState<boolean>(isPublic);
  
  // Check if user is premium
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premium = await isPremiumUser();
      setUserIsPremium(premium);
      
      // If user is not premium and the course is private, 
      // force it to be public and update the database
      if (!premium && !isPublic) {
        setIsPublicState(true);
        await handleVisibilityChange(true);
      }
    };
    
    if (user && isOwner) {
      checkPremiumStatus();
    }
  }, [user, isOwner, isPublic, courseId]);
  
  const handleVisibilityChange = async (makePublic: boolean) => {
    // If trying to make course private but user isn't premium
    if (!makePublic && !userIsPremium) {
      toast.error("Making courses private is a premium feature. Please upgrade your account.");
      return;
    }

    const { error } = await supabase
      .from('courses')
      .update({ is_public: makePublic })
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to update course visibility');
      return;
    }

    setIsPublicState(makePublic);
    toast.success(`Course is now ${makePublic ? 'public' : 'private'}`);
  };

  const handlePaidOnlyChange = async (isPaidOnly: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_paid_only: isPaidOnly })
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to update course access');
      return;
    }

    toast.success(`Course is now ${isPaidOnly ? 'premium only' : 'free'}`);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/course/${courseId}${shareToken ? `?share=${shareToken}` : ''}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  if (!isOwner) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {isPublic ? (
          <>
            <Eye className="h-4 w-4" />
            <span>Public course</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Private course</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-white">Course Visibility</Label>
          <p className="text-sm text-gray-400">Make this course visible to everyone</p>
        </div>
        <Switch
          checked={isPublicState}
          onCheckedChange={handleVisibilityChange}
          disabled={!userIsPremium && isPublicState} // Disable if user is not premium AND course is public
        />
      </div>

      {!userIsPremium && (
        <div className="p-3 bg-kibi-600/20 rounded-md flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-kibi-400" />
          <span>Making courses private requires a premium account</span>
        </div>
      )}

      {isPublicState && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Premium Access</Label>
            <p className="text-sm text-gray-400">Restrict access to paid subscribers</p>
          </div>
          <Switch
            checked={isPaidOnly}
            onCheckedChange={handlePaidOnlyChange}
          />
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full bg-dark-300 hover:bg-dark-200 text-white"
        onClick={copyShareLink}
      >
        <Link className="h-4 w-4 mr-2" />
        Copy Share Link
      </Button>
    </div>
  );
};

export default CourseVisibilityControls;
