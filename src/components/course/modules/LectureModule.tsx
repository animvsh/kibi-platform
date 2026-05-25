
import React from 'react';
import { Card } from "@/components/ui/card";
import { getModuleIcon, getModuleTypeLabel } from '../ModuleTypeBadge';
import { LectureModuleProps } from '@/types/course';
import { Button } from "@/components/ui/button";
import { CheckCircle, Video, AlertCircle, YoutubeIcon, ExternalLink } from "lucide-react";
import { useYoutubeVideoData } from '@/hooks/useYoutubeVideoData';

const LectureModule: React.FC<LectureModuleProps> = ({ 
  module, 
  moduleIdx, 
  onComplete, 
  isCompleted 
}) => {
  // Get content from module structure
  const video = module.content?.video;
  const transcript = module.content?.transcript;

  // Extract videoId - prioritize direct videoId prop, then video.video_id
  const directVideoId = module.videoId;
  const contentVideoId = video?.video_id;
  const videoId = directVideoId || contentVideoId || '';

  // Use the hook to fetch video data if needed
  const { data: videoData } = useYoutubeVideoData(videoId);

  // Display video title from available data
  const videoTitle = video?.title || videoData?.title || module.title;

  // Allow explicit embedding of videos via videoId prop or searchKeyword
  const searchKeyword = module.searchKeyword;
  const hasVideoToEmbed = !!videoId;
  const hasSearchKeyword = !!searchKeyword;

  // Format transcript for better readability
  const formattedTranscript = React.useMemo(() => {
    if (!transcript) return null;
    
    // Create better paragraph breaks
    return transcript
      .replace(/(?:\.\s+|\?\s+|\!\s+)([A-Z])/g, '.\n\n$1') // Add paragraph breaks after sentences
      .split('\n')
      .map((paragraph, i) => paragraph.trim())
      .filter(p => p.length > 0)
      .join('\n\n');
  }, [transcript]);

  return (
    <Card className="p-4 border-2 border-dark-100 bg-dark-300 mb-6">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="bg-kibi-600/60 p-2 rounded-full">
            {getModuleIcon(module.type)}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold">{module.title}</h5>
            {getModuleTypeLabel(module.type)}
          </div>

          {/* Embed video if videoId found, otherwise show search message */}
          {hasVideoToEmbed ? (
            <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : hasSearchKeyword ? (
            <div className="flex flex-col items-center justify-center p-6 bg-dark-400 rounded-lg mt-4 border border-dashed border-dark-100">
              <YoutubeIcon className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-white text-center">
                Searching for video: "{searchKeyword}"
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                This video will be automatically fetched when you view the course.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-dark-400 rounded-lg mt-4 border border-dashed border-dark-100">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
              <p className="text-white text-center">
                No video content available for this lecture
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                You can add a video by setting a 'videoId' in the module properties.
              </p>
            </div>
          )}

          {/* Video metadata if available */}
          {video && videoId && (
            <div className="mt-4 p-3 bg-dark-400 rounded-md text-sm">
              <p className="text-gray-300">
                <span className="text-kibi-400 font-semibold">Channel:</span> {video.channel || "Unknown"}
              </p>
              {video.duration && (
                <p className="text-gray-300">
                  <span className="text-kibi-400 font-semibold">Duration:</span> {video.duration.replace('PT', '').toLowerCase()}
                </p>
              )}
              <div className="mt-2">
                <a 
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-kibi-400 hover:text-kibi-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" /> Watch on YouTube
                </a>
              </div>
            </div>
          )}

          {/* Transcript display with improved formatting */}
          {formattedTranscript && (
            <div className="mt-6">
              <h6 className="text-lg font-bold mb-2 text-white/90 flex items-center">
                <Video className="w-4 h-4 mr-2 text-kibi-400" /> 
                Full Transcript
              </h6>
              <div className="bg-dark-400 border border-dark-200 rounded-lg p-4 overflow-y-auto max-h-96 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {formattedTranscript}
              </div>
            </div>
          )}

          {!isCompleted && (
            <div className="flex justify-end mt-4">
              <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
                Mark as Complete
              </Button>
            </div>
          )}
          
          {isCompleted && (
            <div className="flex items-center justify-end mt-4 text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LectureModule;
