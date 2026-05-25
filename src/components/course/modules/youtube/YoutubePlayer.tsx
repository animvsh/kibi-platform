
import React, { useRef } from 'react';
import { useYoutubePlayerSetup } from '@/hooks/useYoutubePlayerSetup';

interface YouTubePlayer {
  pauseVideo: () => void;
  playVideo: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

interface YoutubePlayerProps {
  videoId: string;
  onPlayerReady: (player: YouTubePlayer) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ 
  videoId, 
  onPlayerReady, 
  onPlayStateChange 
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  useYoutubePlayerSetup({
    videoId,
    containerRef: playerContainerRef,
    onPlayerReady,
    onPlayStateChange,
  });

  return (
    <div className="aspect-video rounded-lg overflow-hidden border-4 border-dark-400">
      <div ref={playerContainerRef} className="w-full h-full"></div>
    </div>
  );
};

export default YoutubePlayer;
