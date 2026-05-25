
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Video } from "lucide-react";

interface VideoSectionProps {
  videoIds?: string[];
  isLoading: boolean;
}

const VideoSection = ({ videoIds, isLoading }: VideoSectionProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-kibi-600/30 flex items-center justify-center mr-3">
          <Video className="w-5 h-5 text-kibi-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Related Videos</h3>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full bg-dark-300" />
          <Skeleton className="h-40 w-full bg-dark-300" />
        </div>
      ) : videoIds && videoIds.length > 0 ? (
        <div className="space-y-4">
          {videoIds.map((videoId, idx) => (
            <div key={idx} className="aspect-video rounded-lg overflow-hidden border-4 border-dark-300">
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Video ${idx + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">Related videos are being loaded...</p>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
