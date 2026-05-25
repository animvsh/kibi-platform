
import { useQuery } from '@tanstack/react-query';

interface YoutubeVideoDetails {
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
}

export const useYoutubeVideoData = (videoId?: string) => {
  return useQuery({
    queryKey: ['youtube', videoId],
    queryFn: async (): Promise<YoutubeVideoDetails> => {
      if (!videoId) throw new Error('Video ID is required');
      
      const response = await fetch('/api/functions/v1/fetch-youtube-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }

      const data = await response.json();
      return data.videoDetails;
    },
    enabled: !!videoId,
  });
};
