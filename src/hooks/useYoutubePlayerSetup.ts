
import { useEffect } from 'react';

interface YouTubePlayer {
  pauseVideo: () => void;
  playVideo: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

interface UseYoutubePlayerSetupProps {
  videoId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onPlayerReady: (player: YouTubePlayer) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        container: HTMLElement | string,
        options: {
          videoId: string;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
  }
}

export const useYoutubePlayerSetup = ({
  videoId,
  containerRef,
  onPlayerReady,
  onPlayStateChange,
}: UseYoutubePlayerSetupProps) => {
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;
      
      new window.YT.Player(containerRef.current, {
        videoId,
        events: {
          onReady: (event) => {
            onPlayerReady(event.target);
          },
          onStateChange: (event) => {
            onPlayStateChange(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId, containerRef, onPlayerReady, onPlayStateChange]);
};
