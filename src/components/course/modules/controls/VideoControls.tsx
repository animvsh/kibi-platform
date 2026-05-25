
import React from 'react';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  checkpoints: number[];
  completedCheckpoints: number[];
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  checkpoints,
  completedCheckpoints
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {isPlaying ? 
          <Pause className="h-4 w-4 text-kibi-300" /> : 
          <Play className="h-4 w-4 text-kibi-300" />
        }
        <span className="text-gray-300">{formatTime(currentTime)}</span>
      </div>
      
      <div className="flex gap-2">
        {checkpoints && checkpoints.map((checkpoint, i) => (
          <Badge 
            key={i}
            variant={completedCheckpoints.includes(checkpoint) ? "default" : "outline"}
            className={completedCheckpoints.includes(checkpoint) ? "bg-green-600/30 text-green-300" : "bg-dark-400"}
          >
            {formatTime(checkpoint)}
            {completedCheckpoints.includes(checkpoint) && 
              <CheckCircle className="ml-1 h-3 w-3 text-green-300" />
            }
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default VideoControls;
