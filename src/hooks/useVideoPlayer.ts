
import { useState, useEffect } from 'react';

interface YouTubePlayer {
  pauseVideo: () => void;
  playVideo: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

export const useVideoPlayer = (
  onPlayerReady: (player: YouTubePlayer) => void,
  checkpoints: number[] = [],
  onCheckpoint: (time: number) => void
) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkpointCompleted, setCheckpointCompleted] = useState<number[]>([]);

  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = window.setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);
      
      const nextCheckpoint = checkpoints.find(cp => 
        Math.abs(time - cp) < 1 && !checkpointCompleted.includes(cp)
      );
      
      if (nextCheckpoint) {
        player.pauseVideo();
        setIsPlaying(false);
        onCheckpoint(nextCheckpoint);
        setCheckpointCompleted(prev => [...prev, nextCheckpoint]);
      }
    }, 1000);
    
    return () => window.clearInterval(interval);
  }, [player, isPlaying, checkpoints, onCheckpoint]);

  const handlePlayerReady = (newPlayer: YouTubePlayer) => {
    setPlayer(newPlayer);
    onPlayerReady(newPlayer);
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  return {
    player,
    currentTime,
    isPlaying,
    checkpointCompleted,
    handlePlayerReady,
    handlePlayStateChange
  };
};
