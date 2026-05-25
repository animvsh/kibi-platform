
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { isPremiumUser } from '@/utils/premium';
import { AlertCircle, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseMetadataFormProps {
  metadata: {
    tags: string[];
    level: string;
    duration: string;
    topics: string[];
  };
  isPublic: boolean;
  isPaidOnly: boolean;
  onMetadataChange: (field: string, value: any) => void;
  onVisibilityChange: (field: 'isPublic' | 'isPaidOnly', value: boolean) => void;
}

const CourseMetadataForm = ({
  metadata,
  isPublic,
  isPaidOnly,
  onMetadataChange,
  onVisibilityChange
}: CourseMetadataFormProps) => {
  const [userIsPremium, setUserIsPremium] = useState<boolean>(false);
  
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premium = await isPremiumUser();
      setUserIsPremium(premium);
      
      // If user is not premium and course is not public,
      // force it to be public
      if (!premium && !isPublic) {
        onVisibilityChange('isPublic', true);
      }
    };
    
    checkPremiumStatus();
  }, [isPublic, onVisibilityChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Course Tags (comma-separated)</Label>
        <Input
          placeholder="react, javascript, webdev"
          value={metadata.tags.join(', ')}
          onChange={(e) => onMetadataChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulty Level</Label>
        <Select
          value={metadata.level}
          onValueChange={(value) => onMetadataChange('level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Estimated Duration</Label>
        <Input
          placeholder="e.g., 2h, 1d, 1w"
          value={metadata.duration}
          onChange={(e) => onMetadataChange('duration', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Topics (comma-separated)</Label>
        <Input
          placeholder="JSX, Hooks, State Management"
          value={metadata.topics.join(', ')}
          onChange={(e) => onMetadataChange('topics', e.target.value.split(',').map(topic => topic.trim()))}
        />
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="space-y-0.5">
          <Label>Public Course</Label>
          <p className="text-sm text-gray-400">Make this course visible in the public library</p>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={(checked) => onVisibilityChange('isPublic', checked)}
          disabled={!userIsPremium && isPublic} // Disable toggling off for non-premium
        />
      </div>

      {!userIsPremium && isPublic && (
        <Alert variant="default" className="bg-kibi-600/20 border-kibi-600/40">
          <Crown className="h-4 w-4 text-kibi-400" />
          <AlertDescription>
            Premium account required to create private courses
          </AlertDescription>
        </Alert>
      )}

      {isPublic && (
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <Label>Paid Access Only</Label>
            <p className="text-sm text-gray-400">Restrict access to paid subscribers</p>
          </div>
          <Switch
            checked={isPaidOnly}
            onCheckedChange={(checked) => onVisibilityChange('isPaidOnly', checked)}
          />
        </div>
      )}
    </div>
  );
};

export default CourseMetadataForm;
